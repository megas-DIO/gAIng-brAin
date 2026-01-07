"""
VIBRANIUM Phase 2: The Soul - Vector Memory System
Portable vector database for Vision's long-term memory.

Uses SQLite with vector extensions for maximum portability.
All embeddings and memories stored on the drive.
"""

const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { VISION_DATA } = require('../config/env');

class VectorMemory {
    constructor() {
        this.dbPath = path.join(VISION_DATA, 'vector_memory.db');
        this.ensureDataDir();
        this.db = null;
        this.init();
    }

    ensureDataDir() {
        if (!fs.existsSync(VISION_DATA)) {
            fs.mkdirSync(VISION_DATA, { recursive: true });
        }
    }

    init() {
        // Initialize SQLite database
        this.db = new sqlite3(this.dbPath);

        // Create memories table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                metadata TEXT,
                embedding BLOB,
                source TEXT,
                type TEXT DEFAULT 'text',
                importance INTEGER DEFAULT 5,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                accessed_count INTEGER DEFAULT 0,
                last_accessed DATETIME
            );

            CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
            CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance);
            CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
        `);

        // Create chunks table for document chunking
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS document_chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                embedding BLOB,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_chunks_doc ON document_chunks(document_id);
        `);

        // Create tags table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS memory_tags (
                memory_id INTEGER NOT NULL,
                tag TEXT NOT NULL,
                FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_tags_memory ON memory_tags(memory_id);
            CREATE INDEX IF NOT EXISTS idx_tags_tag ON memory_tags(tag);
        `);

        console.log(`[VectorMemory] Initialized at ${this.dbPath}`);
    }

    /**
     * Store a memory with optional embedding
     */
    async storeMemory(content, options = {}) {
        const {
            metadata = {},
            embedding = null,
            source = 'manual',
            type = 'text',
            importance = 5,
            tags = []
        } = options;

        // Serialize metadata
        const metadataJson = JSON.stringify(metadata);

        // Serialize embedding if provided
        const embeddingBlob = embedding ? Buffer.from(new Float32Array(embedding).buffer) : null;

        // Insert memory
        const stmt = this.db.prepare(`
            INSERT INTO memories (content, metadata, embedding, source, type, importance)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(content, metadataJson, embeddingBlob, source, type, importance);
        const memoryId = result.lastInsertRowid;

        // Add tags
        if (tags.length > 0) {
            const tagStmt = this.db.prepare('INSERT INTO memory_tags (memory_id, tag) VALUES (?, ?)');
            for (const tag of tags) {
                tagStmt.run(memoryId, tag.toLowerCase());
            }
        }

        console.log(`[VectorMemory] Stored memory #${memoryId}: "${content.substring(0, 50)}..."`);
        return memoryId;
    }

    /**
     * Store document chunks (for PDFs, long texts)
     */
    async storeDocumentChunks(documentId, chunks, embeddings = null) {
        const stmt = this.db.prepare(`
            INSERT INTO document_chunks (document_id, chunk_index, content, embedding, metadata)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = embeddings && embeddings[i];
            const embeddingBlob = embedding ? Buffer.from(new Float32Array(embedding).buffer) : null;

            stmt.run(
                documentId,
                i,
                chunk.content || chunk,
                embeddingBlob,
                JSON.stringify(chunk.metadata || {})
            );
        }

        console.log(`[VectorMemory] Stored ${chunks.length} chunks for document: ${documentId}`);
        return chunks.length;
    }

    /**
     * Retrieve memories by keyword search
     */
    searchByKeyword(query, limit = 10) {
        const stmt = this.db.prepare(`
            SELECT id, content, metadata, type, importance, created_at, accessed_count
            FROM memories
            WHERE content LIKE ?
            ORDER BY importance DESC, created_at DESC
            LIMIT ?
        `);

        const results = stmt.all(`%${query}%`, limit);

        // Update access count
        const updateStmt = this.db.prepare(`
            UPDATE memories
            SET accessed_count = accessed_count + 1, last_accessed = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        for (const result of results) {
            updateStmt.run(result.id);
            result.metadata = JSON.parse(result.metadata || '{}');
        }

        return results;
    }

    /**
     * Search by tag
     */
    searchByTag(tag, limit = 10) {
        const stmt = this.db.prepare(`
            SELECT m.id, m.content, m.metadata, m.type, m.importance, m.created_at
            FROM memories m
            JOIN memory_tags mt ON m.id = mt.memory_id
            WHERE mt.tag = ?
            ORDER BY m.importance DESC, m.created_at DESC
            LIMIT ?
        `);

        const results = stmt.all(tag.toLowerCase(), limit);

        for (const result of results) {
            result.metadata = JSON.parse(result.metadata || '{}');
        }

        return results;
    }

    /**
     * Get recent memories
     */
    getRecent(limit = 20, type = null) {
        let sql = `
            SELECT id, content, metadata, type, importance, created_at, accessed_count
            FROM memories
        `;

        const params = [];

        if (type) {
            sql += ' WHERE type = ?';
            params.push(type);
        }

        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        const stmt = this.db.prepare(sql);
        const results = stmt.all(...params);

        for (const result of results) {
            result.metadata = JSON.parse(result.metadata || '{}');
        }

        return results;
    }

    /**
     * Get memory statistics
     */
    getStats() {
        const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM memories');
        const total = totalStmt.get().count;

        const byTypeStmt = this.db.prepare(`
            SELECT type, COUNT(*) as count
            FROM memories
            GROUP BY type
        `);
        const byType = byTypeStmt.all();

        const chunksStmt = this.db.prepare('SELECT COUNT(*) as count FROM document_chunks');
        const totalChunks = chunksStmt.get().count;

        const tagsStmt = this.db.prepare('SELECT COUNT(DISTINCT tag) as count FROM memory_tags');
        const uniqueTags = tagsStmt.get().count;

        const topTagsStmt = this.db.prepare(`
            SELECT tag, COUNT(*) as count
            FROM memory_tags
            GROUP BY tag
            ORDER BY count DESC
            LIMIT 10
        `);
        const topTags = topTagsStmt.all();

        return {
            total_memories: total,
            by_type: byType,
            total_chunks: totalChunks,
            unique_tags: uniqueTags,
            top_tags: topTags
        };
    }

    /**
     * Delete old memories (cleanup)
     */
    deleteOldMemories(daysOld, minImportance = 3) {
        const stmt = this.db.prepare(`
            DELETE FROM memories
            WHERE created_at < datetime('now', '-' || ? || ' days')
            AND importance < ?
        `);

        const result = stmt.run(daysOld, minImportance);
        console.log(`[VectorMemory] Deleted ${result.changes} old memories`);
        return result.changes;
    }

    /**
     * Export memories to JSON
     */
    exportAll() {
        const memories = this.db.prepare('SELECT * FROM memories ORDER BY created_at DESC').all();
        const tags = this.db.prepare('SELECT * FROM memory_tags').all();
        const chunks = this.db.prepare('SELECT * FROM document_chunks ORDER BY document_id, chunk_index').all();

        return {
            memories,
            tags,
            chunks,
            exported_at: new Date().toISOString()
        };
    }

    /**
     * Close database
     */
    close() {
        if (this.db) {
            this.db.close();
            console.log('[VectorMemory] Database closed');
        }
    }
}

// Singleton instance
let instance = null;

function getVectorMemory() {
    if (!instance) {
        instance = new VectorMemory();
    }
    return instance;
}

module.exports = {
    VectorMemory,
    getVectorMemory
};
