require('dotenv').config();
const express = require('express');
const ngrok = require('@ngrok/ngrok');
const { createClient } = require('@supabase/supabase-js');
const { MemoryClient } = require('mem0ai');

// 1) Load env vars (set these before running)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN;
const ENABLE_NGROK = process.env.ENABLE_NGROK === '1';
const GAING_SHARED_TOKEN = process.env.GAING_SHARED_TOKEN;
const MEM0_API_KEY = process.env.MEM0_API_KEY; // Added for mem0ai

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set; using anon key which may fail with RLS.');
}

// 2) Create Supabase client
const supabase = createClient(SUPABASE_URL, supabaseKey);

// 2.1) Initialize Mem0 (assuming it can use Supabase client)
let mem0 = null;
if (MEM0_API_KEY) {
  mem0 = new MemoryClient({ apiKey: MEM0_API_KEY });
} else {
  console.warn('MEM0_API_KEY not set; /addMemory and /searchMemory will return 503.');
}

// 3) Create Express app
const app = express();
const PORT = 8080;

app.use(express.json());

function toLimit(value, fallback = 50, max = 200) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

async function requireAuth(req, res, next) {
  const authHeader = req.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing bearer token' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'missing bearer token' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'invalid token' });
  }

  req.authUser = data.user;
  next();
}

// Health check
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'gAIng brain online' });
});

// Register a member: POST /members { user_id: "alice", display_name: "Alice" }
app.post('/members', requireAuth, async (req, res) => {
  try {
    const {
      user_id,
      display_name,
      regular_name,
      government_name,
      company,
      key_ref,
      base_url,
      notes,
    } = req.body;

    const finalUserId = user_id || regular_name || req.authUser.id;
    if (!finalUserId) {
      return res.status(400).json({ error: 'user_id or regular_name is required' });
    }

    const payload = {
      user_id: finalUserId,
      owner_id: req.authUser.id,
      display_name: display_name || regular_name || null,
      regular_name: regular_name || display_name || null,
      government_name: government_name || null,
      company: company || null,
      key_ref: key_ref || null,
      base_url: base_url || null,
      notes: notes || null,
    };

    const { data, error } = await supabase
      .from('members')
      .upsert([payload], { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true, member: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// List members: GET /members
app.get('/members', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('owner_id', req.authUser.id)
      .order('user_id', { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true, members: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// List member names only: GET /members/names
app.get('/members/names', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('user_id,regular_name,display_name')
      .eq('owner_id', req.authUser.id)
      .order('user_id', { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    const names = data.map((row) => row.user_id || row.regular_name || row.display_name);
    res.type('text/plain').send(names.join(', '));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Create a memory in Supabase: POST /memories { content, tags?, metadata?, source? }
app.post('/memories', requireAuth, async (req, res) => {
  try {
    const { content, tags, metadata, source } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const memoryPayload = {
      owner_id: req.authUser.id,
      user_id: req.authUser.id,
      content,
      tags: tags || [],
      metadata: metadata || {},
    };

    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .insert([memoryPayload])
      .select()
      .single();

    if (memoryError) {
      console.error(memoryError);
      return res.status(500).json({ error: memoryError.message });
    }

    let sourceResult = null;
    if (source && source.source_type) {
      const sourcePayload = {
        memory_id: memory.id,
        owner_id: req.authUser.id,
        source_type: source.source_type,
        source_ref: source.source_ref || null,
        tool: source.tool || null,
        confidence: source.confidence ?? null,
        metadata: source.metadata || {},
      };

      const { data: sourceData, error: sourceError } = await supabase
        .from('memory_sources')
        .insert([sourcePayload])
        .select()
        .single();

      if (sourceError) {
        console.error(sourceError);
        sourceResult = { error: sourceError.message };
      } else {
        sourceResult = sourceData;
      }
    }

    res.json({ ok: true, memory, source: sourceResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// List memories: GET /memories?limit=50
app.get('/memories', requireAuth, async (req, res) => {
  try {
    const limit = toLimit(req.query.limit);
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('owner_id', req.authUser.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true, memories: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Search memories: GET /memories/search?q=term&limit=25
app.get('/memories/search', requireAuth, async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({ error: 'q is required' });
    }

    const limit = toLimit(req.query.limit, 25, 100);
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('owner_id', req.authUser.id)
      .ilike('content', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true, memories: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update memory: PATCH /memories/:id { content?, tags?, metadata?, reason? }
app.patch('/memories/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, tags, metadata, reason } = req.body;

    const hasContent = Object.prototype.hasOwnProperty.call(req.body, 'content');
    const hasTags = Object.prototype.hasOwnProperty.call(req.body, 'tags');
    const hasMetadata = Object.prototype.hasOwnProperty.call(req.body, 'metadata');

    if (!hasContent && !hasTags && !hasMetadata) {
      return res.status(400).json({ error: 'content, tags, or metadata is required' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .eq('owner_id', req.authUser.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'memory not found' });
    }

    const updatePayload = {
      content: hasContent ? content : existing.content,
      tags: hasTags ? tags : existing.tags,
      metadata: hasMetadata ? metadata : existing.metadata,
    };

    const { data: updated, error: updateError } = await supabase
      .from('memories')
      .update(updatePayload)
      .eq('id', id)
      .eq('owner_id', req.authUser.id)
      .select()
      .single();

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: updateError.message });
    }

    const revisionPayload = {
      memory_id: id,
      owner_id: req.authUser.id,
      previous_content: existing.content,
      new_content: updated.content,
      reason: reason || null,
    };

    await supabase.from('memory_revisions').insert([revisionPayload]);

    res.json({ ok: true, memory: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Vote on memory: POST /memories/:id/vote { vote: 1|-1 }
app.post('/memories/:id/vote', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const vote = Number(req.body.vote);
    if (![1, -1].includes(vote)) {
      return res.status(400).json({ error: 'vote must be 1 or -1' });
    }

    const payload = {
      memory_id: id,
      owner_id: req.authUser.id,
      vote,
    };

    const { data, error } = await supabase
      .from('memory_votes')
      .upsert([payload], { onConflict: 'memory_id,owner_id' })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true, vote: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /addMemory  { content: "something", tags: ["genealogy","idea"], metadata?: {} }
app.post('/addMemory', requireAuth, async (req, res) => {
  try {
    if (!mem0) {
      return res.status(503).json({ error: 'mem0 not configured' });
    }

    const { text, content, tags, metadata } = req.body;
    const finalContent = content || text;

    if (!finalContent) {
      return res.status(400).json({ error: 'content is required' });
    }
    const memory = await mem0.add(finalContent, {
      user_id: req.authUser.id,
      tags: tags || [],
      metadata: metadata || {},
    });

    res.json({ ok: true, memory: memory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /searchMemory?q=term
app.get('/searchMemory', requireAuth, async (req, res) => {
  try {
    if (!mem0) {
      return res.status(503).json({ error: 'mem0 not configured' });
    }

    const q = req.query.q;
    const userId = req.authUser.id;
    if (!q) {
      return res.status(400).json({ error: 'q is required' });
    }

    const results = await mem0.search(q, { user_id: userId });

    res.json({ ok: true, results: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// 4) Start server + ngrok
app.listen(PORT, async () => {
  console.log(`Express server listening on port ${PORT}`);

  if (!ENABLE_NGROK) {
    console.log('Ngrok disabled. Set ENABLE_NGROK=1 to enable tunneling.');
    return;
  }

  if (!NGROK_AUTHTOKEN) {
    console.warn('ENABLE_NGROK=1 but NGROK_AUTHTOKEN is not set; skipping ngrok.');
    return;
  }

  try {
    const listener = await ngrok.connect({
      addr: PORT,
      authtoken_from_env: true,
    });
    console.log(`Ingress established at: ${listener.url()}`);
  } catch (err) {
    console.error('Error starting ngrok:', err);
  }
});
