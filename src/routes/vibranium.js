/**
 * VIBRANIUM API Routes
 *
 * Endpoints for accessing Phase 2-6 features:
 * - Vector Memory
 * - Thought Stream
 * - Drop Watcher
 * - Dream Cycle
 */

const express = require('express');
const router = express.Router();
const { getVectorMemory } = require('../services/vectorMemory');
const { getThoughtStream } = require('../services/thoughtStream');
const { getDropWatcher } = require('../services/dropWatcher');
const { getDreamCycle } = require('../services/dreamCycle');

// ============================================================================
// Vector Memory Routes
// ============================================================================

/**
 * GET /api/vibranium/memory/search?q=query&limit=10
 * Search memories by keyword
 */
router.get('/memory/search', (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const memory = getVectorMemory();
        const results = memory.searchByKeyword(q, parseInt(limit));

        res.json({
            query: q,
            count: results.length,
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/vibranium/memory/recent?limit=20&type=document
 * Get recent memories
 */
router.get('/memory/recent', (req, res) => {
    try {
        const { limit = 20, type } = req.query;

        const memory = getVectorMemory();
        const results = memory.getRecent(parseInt(limit), type || null);

        res.json({
            count: results.length,
            type: type || 'all',
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/vibranium/memory/tags/:tag
 * Search by tag
 */
router.get('/memory/tags/:tag', (req, res) => {
    try {
        const { tag } = req.params;
        const { limit = 10 } = req.query;

        const memory = getVectorMemory();
        const results = memory.searchByTag(tag, parseInt(limit));

        res.json({
            tag,
            count: results.length,
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/vibranium/memory/stats
 * Get memory statistics
 */
router.get('/memory/stats', (req, res) => {
    try {
        const memory = getVectorMemory();
        const stats = memory.getStats();

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/vibranium/memory/store
 * Store a new memory
 */
router.post('/memory/store', async (req, res) => {
    try {
        const { content, tags = [], importance = 5, type = 'manual', metadata = {} } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const memory = getVectorMemory();
        const memoryId = await memory.storeMemory(content, {
            tags,
            importance,
            type,
            metadata,
            source: 'api'
        });

        res.json({
            success: true,
            memory_id: memoryId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Thought Stream Routes
// ============================================================================

/**
 * GET /api/vibranium/stream/recent?limit=20&type=think
 * Get recent thoughts
 */
router.get('/stream/recent', (req, res) => {
    try {
        const { limit = 20, type } = req.query;

        const stream = getThoughtStream();
        const thoughts = stream.getRecent(parseInt(limit), type || null);

        res.json({
            count: thoughts.length,
            type: type || 'all',
            thoughts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/vibranium/stream/search?q=query&limit=50
 * Search thoughts
 */
router.get('/stream/search', (req, res) => {
    try {
        const { q, limit = 50 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const stream = getThoughtStream();
        const thoughts = stream.search(q, parseInt(limit));

        res.json({
            query: q,
            count: thoughts.length,
            thoughts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/vibranium/stream/stats
 * Get thought stream statistics
 */
router.get('/stream/stats', (req, res) => {
    try {
        const stream = getThoughtStream();
        const stats = stream.getStats();

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/vibranium/stream/think
 * Add a thought
 */
router.post('/stream/think', (req, res) => {
    try {
        const { type = 'think', content, metadata = {} } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const stream = getThoughtStream();
        const thought = stream.add(type, content, metadata);

        res.json({
            success: true,
            thought
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Drop Watcher Routes
// ============================================================================

/**
 * GET /api/vibranium/drop/stats
 * Get drop watcher statistics
 */
router.get('/drop/stats', (req, res) => {
    try {
        const watcher = getDropWatcher();
        const stats = watcher.getStats();

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/vibranium/drop/start
 * Start watching drop folder
 */
router.post('/drop/start', (req, res) => {
    try {
        const watcher = getDropWatcher();
        watcher.start();

        res.json({
            success: true,
            message: 'Drop watcher started'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/vibranium/drop/stop
 * Stop watching drop folder
 */
router.post('/drop/stop', (req, res) => {
    try {
        const watcher = getDropWatcher();
        watcher.stop();

        res.json({
            success: true,
            message: 'Drop watcher stopped'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Dream Cycle Routes
// ============================================================================

/**
 * GET /api/vibranium/dream/stats
 * Get dream cycle statistics
 */
router.get('/dream/stats', (req, res) => {
    try {
        const dream = getDreamCycle();
        const stats = dream.getCycleStats();

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/vibranium/dream/last
 * Get last dream cycle
 */
router.get('/dream/last', (req, res) => {
    try {
        const dream = getDreamCycle();
        const lastCycle = dream.getLastCycle();

        if (!lastCycle) {
            return res.status(404).json({ error: 'No dream cycles found' });
        }

        res.json(lastCycle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/vibranium/dream/run
 * Trigger a dream cycle manually
 */
router.post('/dream/run', async (req, res) => {
    try {
        const dream = getDreamCycle();

        // Run asynchronously
        dream.run().catch(err => {
            console.error('[API] Dream cycle error:', err);
        });

        res.json({
            success: true,
            message: 'Dream cycle started (running in background)'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// System Overview
// ============================================================================

/**
 * GET /api/vibranium/status
 * Get complete VIBRANIUM system status
 */
router.get('/status', (req, res) => {
    try {
        const memory = getVectorMemory();
        const stream = getThoughtStream();
        const watcher = getDropWatcher();
        const dream = getDreamCycle();

        const status = {
            vibranium: {
                phase: 'All 6 Phases Active',
                version: '2.0'
            },
            memory: memory.getStats(),
            stream: stream.getStats(),
            drop_watcher: watcher.getStats(),
            dream_cycle: dream.getCycleStats()
        };

        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
