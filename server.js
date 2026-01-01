import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { randomUUID } from 'node:crypto';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const PORT = Number(process.env.PORT || 3000);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EMBED_PROVIDER = (process.env.EMBED_PROVIDER || 'none').toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';

const BRAIN_TOKENS = (process.env.BRAIN_TOKENS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function parseList(envName) {
  const raw = process.env[envName];
  if (!raw) return undefined;
  const arr = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

const ALLOWED_HOSTS = parseList('ALLOWED_HOSTS');
const ALLOWED_ORIGINS = parseList('ALLOWED_ORIGINS');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

if (BRAIN_TOKENS.length === 0 || BRAIN_TOKENS.includes('change-me')) {
  console.error('Set a real BRAIN_TOKENS value in .env (comma-separated tokens).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const openai =
  EMBED_PROVIDER === 'openai'
    ? new OpenAI({ apiKey: OPENAI_API_KEY })
    : null;

const app = express();
app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

function extractToken(req) {
  const headerToken = req.get('X-BRAIN-TOKEN');
  if (headerToken) return headerToken;

  const auth = req.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();

  return null;
}

function authMiddleware(req, res, next) {
  const token = extractToken(req);
  if (!token || !BRAIN_TOKENS.includes(token)) {
    return res.status(401).json({ error: 'Unauthorized (missing/invalid token)' });
  }
  req.auth = { token };
  next();
}

app.get('/health', (req, res) => res.json({ ok: true }));

async function embedText(text) {
  if (EMBED_PROVIDER !== 'openai') return null;
  if (!openai) throw new Error('OPENAI_API_KEY missing but EMBED_PROVIDER=openai');
  const resp = await openai.embeddings.create({ model: OPENAI_EMBED_MODEL, input: text });
  return resp.data[0].embedding;
}

async function brainQuery({ query, top_k, threshold, tags }) {
  if (EMBED_PROVIDER === 'openai') {
    const query_embedding = await embedText(query);
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding,
      match_threshold: threshold,
      match_count: top_k,
      filter_tags: tags?.length ? tags : null
    });
    if (error) throw error;
    return data;
  }

  let q = supabase
    .from('memories')
    .select('id,created_at,author,kind,title,content,tags,confidence,pinned')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(top_k);

  if (tags?.length) q = q.overlaps('tags', tags);

  const needle = String(query || '').trim();
  if (needle.length) {
    const safe = needle.replace(/%/g, '\\%').replace(/_/g, '\\_');
    q = q.or(`title.ilike.%${safe}%,content.ilike.%${safe}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((row) => ({ ...row, similarity: null }));
}

async function brainUpsert(payload) {
  const embedding = EMBED_PROVIDER === 'openai' ? await embedText(payload.content) : null;

  const row = {
    id: payload.id ?? undefined,
    author: payload.author,
    kind: payload.kind,
    title: payload.title ?? null,
    content: payload.content,
    tags: payload.tags ?? [],
    confidence: payload.confidence ?? 0.6,
    pinned: payload.pinned ?? false,
    embedding
  };

  const { data, error } = await supabase
    .from('memories')
    .upsert(row, { onConflict: 'id' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

const QuerySchema = z.object({
  query: z.string().min(1),
  top_k: z.number().int().min(1).max(50).optional().default(8),
  threshold: z.number().min(0).max(1).optional().default(0.0),
  tags: z.array(z.string()).optional()
});

const UpsertSchema = z.object({
  id: z.string().uuid().optional(),
  author: z.string().min(1),
  kind: z.enum(['fact', 'decision', 'task', 'note', 'preference', 'prompt', 'warning']),
  title: z.string().optional(),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  pinned: z.boolean().optional()
});

app.post('/query', authMiddleware, async (req, res) => {
  try {
    const parsed = QuerySchema.parse(req.body);
    const results = await brainQuery(parsed);
    res.json({ results });
  } catch (err) {
    res.status(400).json({ error: err?.message || String(err) });
  }
});

app.post('/upsert', authMiddleware, async (req, res) => {
  try {
    const parsed = UpsertSchema.parse(req.body);
    const id = await brainUpsert(parsed);
    res.json({ ok: true, id });
  } catch (err) {
    res.status(400).json({ error: err?.message || String(err) });
  }
});

const mcpServer = new McpServer({ name: 'gaing-brain', version: '1.0.0' });

mcpServer.tool(
  'brain_query',
  {
    query: z.string().min(1),
    top_k: z.number().int().min(1).max(50).optional(),
    threshold: z.number().min(0).max(1).optional(),
    tags: z.array(z.string()).optional()
  },
  async (args) => {
    const top_k = args.top_k ?? 8;
    const threshold = args.threshold ?? 0.0;
    const results = await brainQuery({ query: args.query, top_k, threshold, tags: args.tags });
    return { content: [{ type: 'text', text: JSON.stringify({ results }, null, 2) }] };
  }
);

mcpServer.tool(
  'brain_upsert',
  {
    id: z.string().uuid().optional(),
    author: z.string().min(1),
    kind: z.enum(['fact', 'decision', 'task', 'note', 'preference', 'prompt', 'warning']),
    title: z.string().optional(),
    content: z.string().min(1),
    tags: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1).optional(),
    pinned: z.boolean().optional()
  },
  async (args) => {
    const id = await brainUpsert(args);
    return { content: [{ type: 'text', text: JSON.stringify({ ok: true, id }) }] };
  }
);

const transportsBySessionId = new Map();

function createTransport() {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sid) => transportsBySessionId.set(sid, transport),
    onsessionclosed: (sid) => transportsBySessionId.delete(sid),
    enableDnsRebindingProtection: Boolean(ALLOWED_HOSTS?.length || ALLOWED_ORIGINS?.length),
    allowedHosts: ALLOWED_HOSTS,
    allowedOrigins: ALLOWED_ORIGINS
  });

  transport.onclose = () => {
    if (transport.sessionId) transportsBySessionId.delete(transport.sessionId);
  };

  return transport;
}

app.all('/mcp', authMiddleware, async (req, res) => {
  try {
    const sid = req.get('mcp-session-id') || req.get('Mcp-Session-Id') || undefined;
    let transport = sid ? transportsBySessionId.get(sid) : undefined;

    if (!transport) {
      transport = createTransport();
      await mcpServer.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`gaing-brain listening on http://localhost:${PORT}`);
  console.log('REST: POST /query, POST /upsert');
  console.log('MCP : /mcp (Streamable HTTP)');
});
