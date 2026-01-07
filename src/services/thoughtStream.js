/**
 * VIBRANIUM Phase 2: Thought Stream
 *
 * Real-time stream of Vision's thoughts, decisions, and internal state.
 * Written to stream.json for monitoring and debugging.
 */

const fs = require('fs');
const path = require('path');
const { VISION_DATA, VISION_LOGS } = require('../config/env');

class ThoughtStream {
    constructor() {
        this.streamPath = path.join(VISION_LOGS, 'stream.json');
        this.thoughts = [];
        this.maxThoughts = 1000; // Keep last 1000 thoughts in memory
        this.init();
    }

    init() {
        // Ensure logs directory exists
        if (!fs.existsSync(VISION_LOGS)) {
            fs.mkdirSync(VISION_LOGS, { recursive: true });
        }

        // Load existing stream if it exists
        if (fs.existsSync(this.streamPath)) {
            try {
                const data = fs.readFileSync(this.streamPath, 'utf8');
                const parsed = JSON.parse(data);
                this.thoughts = parsed.thoughts || [];
                console.log(`[ThoughtStream] Loaded ${this.thoughts.length} existing thoughts`);
            } catch (err) {
                console.error('[ThoughtStream] Error loading existing stream:', err);
                this.thoughts = [];
            }
        }

        console.log(`[ThoughtStream] Initialized at ${this.streamPath}`);
    }

    /**
     * Add a thought to the stream
     */
    add(type, content, metadata = {}) {
        const thought = {
            id: this.thoughts.length + 1,
            type,
            content,
            metadata,
            timestamp: new Date().toISOString()
        };

        this.thoughts.push(thought);

        // Trim if exceeds max
        if (this.thoughts.length > this.maxThoughts) {
            this.thoughts = this.thoughts.slice(-this.maxThoughts);
        }

        // Write to disk (async, don't block)
        this.persist();

        // Also log to console in debug mode
        if (process.env.DEBUG_STREAM === '1') {
            console.log(`[Stream:${type}] ${content}`);
        }

        return thought;
    }

    /**
     * Persist stream to disk
     */
    persist() {
        const data = {
            thoughts: this.thoughts,
            last_updated: new Date().toISOString(),
            total_thoughts: this.thoughts.length
        };

        fs.writeFileSync(this.streamPath, JSON.stringify(data, null, 2));
    }

    /**
     * Specific thought types for convenience
     */

    think(content, metadata = {}) {
        return this.add('think', content, metadata);
    }

    decide(content, metadata = {}) {
        return this.add('decide', content, metadata);
    }

    observe(content, metadata = {}) {
        return this.add('observe', content, metadata);
    }

    error(content, metadata = {}) {
        return this.add('error', content, metadata);
    }

    success(content, metadata = {}) {
        return this.add('success', content, metadata);
    }

    question(content, metadata = {}) {
        return this.add('question', content, metadata);
    }

    learn(content, metadata = {}) {
        return this.add('learn', content, metadata);
    }

    /**
     * Get recent thoughts
     */
    getRecent(count = 20, type = null) {
        let filtered = this.thoughts;

        if (type) {
            filtered = filtered.filter(t => t.type === type);
        }

        return filtered.slice(-count);
    }

    /**
     * Search thoughts
     */
    search(query, limit = 50) {
        const lowerQuery = query.toLowerCase();
        return this.thoughts
            .filter(t =>
                t.content.toLowerCase().includes(lowerQuery) ||
                JSON.stringify(t.metadata).toLowerCase().includes(lowerQuery)
            )
            .slice(-limit);
    }

    /**
     * Get statistics
     */
    getStats() {
        const byType = {};
        for (const thought of this.thoughts) {
            byType[thought.type] = (byType[thought.type] || 0) + 1;
        }

        return {
            total: this.thoughts.length,
            by_type: byType,
            oldest: this.thoughts[0]?.timestamp,
            newest: this.thoughts[this.thoughts.length - 1]?.timestamp
        };
    }

    /**
     * Clear all thoughts
     */
    clear() {
        this.thoughts = [];
        this.persist();
        console.log('[ThoughtStream] Stream cleared');
    }

    /**
     * Export to file
     */
    export(filepath) {
        fs.writeFileSync(filepath, JSON.stringify({
            thoughts: this.thoughts,
            exported_at: new Date().toISOString()
        }, null, 2));
        console.log(`[ThoughtStream] Exported to ${filepath}`);
    }
}

// Singleton instance
let instance = null;

function getThoughtStream() {
    if (!instance) {
        instance = new ThoughtStream();
    }
    return instance;
}

module.exports = {
    ThoughtStream,
    getThoughtStream
};
