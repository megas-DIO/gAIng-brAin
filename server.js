import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

dotenv.config();

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  BRAIN_TOKENS,
  EMBED_PROVIDER = "openai",
  OPENAI_API_KEY,
  OPENAI_EMBED_MODEL = "text-embedding-3-small",
  ALLOWED_HOSTS = "",
  ALLOWED_ORIGINS = "",
  PORT = "3000"
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const allowedHosts = ALLOWED_HOSTS.split(",").map((item) => item.trim()).filter(Boolean);
const allowedOrigins = ALLOWED_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean);

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    }
  })
);

app.use((req, res, next) => {
  if (allowedHosts.length === 0) {
    next();
    return;
  }
  const hostHeader = req.headers.host || "";
  const hostname = hostHeader.split(":")[0];
  if (!allowedHosts.includes(hostname)) {
    res.status(403).json({ error: "Host not allowed" });
    return;
  }
  next();
});

const tokenList = BRAIN_TOKENS ? BRAIN_TOKENS.split(",").map((item) => item.trim()).filter(Boolean) : [];

const requireAuth = (req, res, next) => {
  if (tokenList.length === 0) {
    res.status(500).json({ error: "Server auth not configured" });
    return;
  }
  const headerToken = req.header("X-BRAIN-TOKEN");
  const authHeader = req.header("Authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = headerToken || (bearerMatch ? bearerMatch[1] : "");
  if (!token || !tokenList.includes(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  author: z.string().min(1),
  kind: z.enum(["fact", "decision", "task", "note", "preference", "prompt", "warning"]),
  title: z.string().optional().nullable(),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().nullable(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  pinned: z.boolean().optional().nullable()
});

const querySchema = z.object({
  query: z.string().min(1),
  top_k: z.number().int().min(1).max(200).optional(),
  threshold: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional()
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  req.validatedBody = result.data;
  next();
};

const getEmbedding = async (text) => {
  if (EMBED_PROVIDER !== "openai") {
    return null;
  }
  if (!openai) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  const response = await openai.embeddings.create({
    model: OPENAI_EMBED_MODEL,
    input: text
  });
  return response.data[0].embedding;
};

const upsertMemory = async (payload) => {
  const embedding = await getEmbedding(payload.content);
  const record = {
    id: payload.id,
    author: payload.author,
    kind: payload.kind,
    title: payload.title ?? null,
    content: payload.content,
    tags: payload.tags ?? null,
    confidence: payload.confidence ?? null,
    pinned: payload.pinned ?? null,
    embedding
  };

  const { data, error } = await supabase
    .from("memories")
    .upsert(record, { onConflict: "id" })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return { id: data.id };
};

const queryMemories = async ({ query, top_k = 10, threshold = 0.78, tags }) => {
  if (EMBED_PROVIDER === "openai") {
    const embedding = await getEmbedding(query);
    const { data, error } = await supabase.rpc("match_memories", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: top_k,
      filter_tags: tags ?? null
    });
    if (error) {
      throw error;
    }
    return data ?? [];
  }

  let builder = supabase
    .from("memories")
    .select("id, created_at, author, kind, title, content, tags, confidence, pinned")
    .order("created_at", { ascending: false })
    .limit(top_k);

  if (tags && tags.length > 0) {
    builder = builder.contains("tags", tags);
  }

  if (query) {
    const escaped = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
    builder = builder.or(`title.ilike.%${escaped}%,content.ilike.%${escaped}%`);
  }

  const { data, error } = await builder;
  if (error) {
    throw error;
  }
  return data ?? [];
};

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/upsert", requireAuth, validateBody(upsertSchema), async (req, res) => {
  try {
    const { id } = await upsertMemory(req.validatedBody);
    res.json({ ok: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/query", requireAuth, validateBody(querySchema), async (req, res) => {
  try {
    const results = await queryMemories(req.validatedBody);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const mcpServer = new Server(
  {
    name: "gaing-brain",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "brain_query",
      description: "Query stored memories.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          top_k: { type: "integer", minimum: 1, maximum: 200 },
          threshold: { type: "number", minimum: 0, maximum: 1 },
          tags: { type: "array", items: { type: "string" } }
        },
        required: ["query"]
      }
    },
    {
      name: "brain_upsert",
      description: "Upsert a memory entry.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          author: { type: "string" },
          kind: {
            type: "string",
            enum: ["fact", "decision", "task", "note", "preference", "prompt", "warning"]
          },
          title: { type: "string" },
          content: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          pinned: { type: "boolean" }
        },
        required: ["author", "kind", "content"]
      }
    }
  ]
}));

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "brain_query") {
    const parsed = querySchema.safeParse(request.params.arguments ?? {});
    if (!parsed.success) {
      return {
        content: [
          { type: "text", text: JSON.stringify({ error: parsed.error.flatten() }) }
        ],
        isError: true
      };
    }
    const results = await queryMemories(parsed.data);
    return {
      content: [{ type: "text", text: JSON.stringify({ results }) }]
    };
  }

  if (request.params.name === "brain_upsert") {
    const parsed = upsertSchema.safeParse(request.params.arguments ?? {});
    if (!parsed.success) {
      return {
        content: [
          { type: "text", text: JSON.stringify({ error: parsed.error.flatten() }) }
        ],
        isError: true
      };
    }
    const { id } = await upsertMemory(parsed.data);
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, id }) }]
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify({ error: "Unknown tool" }) }],
    isError: true
  };
});

const mcpTransports = new Map();

app.all("/mcp", requireAuth, async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] || "";
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    res.status(400).json({ error: "Missing mcp-session-id header" });
    return;
  }

  if (req.method === "DELETE") {
    const existing = mcpTransports.get(sessionId);
    if (existing) {
      existing.close();
      mcpTransports.delete(sessionId);
    }
    res.status(204).end();
    return;
  }

  let transport = mcpTransports.get(sessionId);
  if (!transport) {
    transport = new StreamableHTTPTransport({ sessionId });
    transport.connect(mcpServer);
    mcpTransports.set(sessionId, transport);
  }

  await transport.handleRequest(req, res);
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`gaing-brain server listening on ${PORT}`);
});
