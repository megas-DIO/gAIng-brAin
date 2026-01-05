const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const fs = require('fs').promises;

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true, message: 'gAIng brain online' });
});

// Shared log reader
router.get('/system/log', requireAuth, async (req, res) => {
  try {
    const logPath = 'the_log.md';
    const content = await fs.readFile(logPath, 'utf8');
    res.json({ ok: true, content });
  } catch (err) {
    res.status(500).json({ error: 'failed to read log', details: err.message });
  }
});

module.exports = router;

