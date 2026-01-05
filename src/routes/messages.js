const express = require('express');
const router = express.Router();
const wsManager = require('../services/websocket');
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const { sanitizeString, isValidAgentName } = require('../utils/helpers');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

// POST /messages - Send a message
// Body: { sender, recipient, intent, data }
// intent examples: "instruction", "task", "report", "ack", "query"
// recipient: agent name, "broadcast" for all, or null
router.post('/', requireAuth, async (req, res) => {
  try {
    const sender = sanitizeString(req.body.sender, 100);
    const recipient = req.body.recipient ? sanitizeString(req.body.recipient, 100) : null;
    const intent = sanitizeString(req.body.intent, 50);
    const { data } = req.body;

    if (!sender || !intent) {
      return res.status(400).json({ error: 'sender and intent are required' });
    }

    if (!isValidAgentName(sender)) {
      return res.status(400).json({ error: 'invalid sender name format' });
    }

    if (recipient && recipient !== 'broadcast' && !isValidAgentName(recipient)) {
      return res.status(400).json({ error: 'invalid recipient name format' });
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          sender,
          recipient: recipient || 'broadcast',
          intent,
          data: data || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting message:', error);
      return res.status(500).json({ error: error.message });
    }

    // Broadcast message to connected WebSocket clients
    wsManager.broadcast(message, message.recipient);

    res.json({ ok: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to send message' });
  }
});

// GET /messages - List unread messages for authenticated user (or broadcast)
// Query params: ?recipient=agent_name&limit=50&offset=0&include_read=false
router.get('/', requireAuth, async (req, res) => {
  try {
    const { recipient, limit = 50, offset = 0, include_read = false } = req.query;
    const agent_name = recipient || req.user?.email || 'unknown';

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .or(`recipient.eq.${agent_name},recipient.eq.broadcast`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (include_read !== 'true') {
      query = query.is('read_at', null);
    }

    const { data: messages, count, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true, messages, count, recipient: agent_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch messages' });
  }
});

// PATCH /messages/:id - Mark message as read
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: message, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update message' });
  }
});

// GET /messages/sender/:name - List messages from a specific sender
router.get('/sender/:name', requireAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('sender', name)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true, messages, sender: name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch messages' });
  }
});

module.exports = router;
