/**
 * VIBRANIUM Phase 2: Drop Folder Watcher
 *
 * Monitors the drop/ folder for new files and automatically processes them.
 * - PDFs: Extract text, chunk, embed, store in vector memory
 * - Text files: Process and store
 * - Code files: Analyze and index
 * - Images: Future feature (OCR, vision)
 */

const fs = require('fs');
const path = require('path');
const { VISION_DROP, VISION_DATA } = require('../config/env');
const { getVectorMemory } = require('./vectorMemory');
const { getThoughtStream } = require('./thoughtStream');

class DropWatcher {
    constructor() {
        this.dropPath = VISION_DROP;
        this.archivePath = path.join(VISION_DATA, 'archive');
        this.processedFiles = new Set();
        this.watcher = null;
        this.vectorMemory = getVectorMemory();
        this.stream = getThoughtStream();

        this.init();
    }

    init() {
        // Ensure directories exist
        if (!fs.existsSync(this.dropPath)) {
            fs.mkdirSync(this.dropPath, { recursive: true });
        }
        if (!fs.existsSync(this.archivePath)) {
            fs.mkdirSync(this.archivePath, { recursive: true });
        }

        console.log(`[DropWatcher] Monitoring: ${this.dropPath}`);
    }

    /**
     * Start watching the drop folder
     */
    start() {
        if (this.watcher) {
            console.log('[DropWatcher] Already watching');
            return;
        }

        this.stream.observe('Started watching drop folder', { path: this.dropPath });

        // Watch for new files
        this.watcher = fs.watch(this.dropPath, { recursive: false }, (eventType, filename) => {
            if (eventType === 'rename' && filename) {
                const filepath = path.join(this.dropPath, filename);

                // Check if file exists (not deleted) and not already processed
                if (fs.existsSync(filepath) && !this.processedFiles.has(filename)) {
                    this.processedFiles.add(filename);

                    // Small delay to ensure file is fully written
                    setTimeout(() => {
                        this.processFile(filepath, filename);
                    }, 500);
                }
            }
        });

        // Process any existing files
        const existing = fs.readdirSync(this.dropPath);
        for (const filename of existing) {
            if (filename === 'README.txt') continue;

            const filepath = path.join(this.dropPath, filename);
            const stats = fs.statSync(filepath);

            if (stats.isFile() && !this.processedFiles.has(filename)) {
                this.processedFiles.add(filename);
                this.processFile(filepath, filename);
            }
        }

        console.log('[DropWatcher] Watching for new files');
    }

    /**
     * Stop watching
     */
    stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            this.stream.observe('Stopped watching drop folder');
            console.log('[DropWatcher] Stopped watching');
        }
    }

    /**
     * Process a dropped file
     */
    async processFile(filepath, filename) {
        console.log(`[DropWatcher] Processing: ${filename}`);
        this.stream.think(`Processing dropped file: ${filename}`);

        const ext = path.extname(filename).toLowerCase();

        try {
            let result;

            switch (ext) {
                case '.txt':
                case '.md':
                case '.markdown':
                    result = await this.processTextFile(filepath, filename);
                    break;

                case '.pdf':
                    result = await this.processPDF(filepath, filename);
                    break;

                case '.js':
                case '.ts':
                case '.py':
                case '.json':
                case '.yaml':
                case '.yml':
                    result = await this.processCodeFile(filepath, filename, ext);
                    break;

                case '.jpg':
                case '.jpeg':
                case '.png':
                case '.gif':
                    result = await this.processImage(filepath, filename);
                    break;

                default:
                    console.log(`[DropWatcher] Unsupported file type: ${ext}`);
                    this.stream.think(`Unsupported file type: ${filename} (${ext})`);
                    result = { success: false, reason: 'unsupported type' };
            }

            // Archive the file
            if (result && result.success) {
                this.archiveFile(filepath, filename);
                this.stream.success(`Successfully processed: ${filename}`, result);
            }

        } catch (error) {
            console.error(`[DropWatcher] Error processing ${filename}:`, error);
            this.stream.error(`Failed to process: ${filename}`, { error: error.message });
        }
    }

    /**
     * Process text file
     */
    async processTextFile(filepath, filename) {
        const content = fs.readFileSync(filepath, 'utf8');

        // Store in vector memory
        const memoryId = await this.vectorMemory.storeMemory(content, {
            metadata: {
                filename,
                source: 'drop_folder',
                file_type: 'text'
            },
            source: 'drop_folder',
            type: 'document',
            importance: 7,
            tags: ['document', 'text', path.basename(filename, path.extname(filename))]
        });

        console.log(`[DropWatcher] Stored text file: ${filename} (memory #${memoryId})`);

        return {
            success: true,
            memory_id: memoryId,
            type: 'text',
            size: content.length
        };
    }

    /**
     * Process PDF (basic implementation - would need pdf-parse library)
     */
    async processPDF(filepath, filename) {
        // For now, just acknowledge the PDF
        // In production, you'd use pdf-parse or similar
        console.log(`[DropWatcher] PDF processing not fully implemented: ${filename}`);
        this.stream.think(`PDF detected but full processing not available: ${filename}`);

        // Basic metadata storage
        const stats = fs.statSync(filepath);
        await this.vectorMemory.storeMemory(`PDF document: ${filename}`, {
            metadata: {
                filename,
                source: 'drop_folder',
                file_type: 'pdf',
                size: stats.size
            },
            source: 'drop_folder',
            type: 'document',
            importance: 8,
            tags: ['document', 'pdf', path.basename(filename, '.pdf')]
        });

        return {
            success: true,
            type: 'pdf',
            note: 'Metadata stored, full text extraction requires pdf-parse library'
        };
    }

    /**
     * Process code file
     */
    async processCodeFile(filepath, filename, ext) {
        const content = fs.readFileSync(filepath, 'utf8');
        const language = ext.substring(1); // remove dot

        // Store code with language metadata
        const memoryId = await this.vectorMemory.storeMemory(content, {
            metadata: {
                filename,
                source: 'drop_folder',
                file_type: 'code',
                language
            },
            source: 'drop_folder',
            type: 'code',
            importance: 6,
            tags: ['code', language, path.basename(filename, ext)]
        });

        console.log(`[DropWatcher] Stored ${language} code: ${filename} (memory #${memoryId})`);

        return {
            success: true,
            memory_id: memoryId,
            type: 'code',
            language,
            size: content.length
        };
    }

    /**
     * Process image (future feature)
     */
    async processImage(filepath, filename) {
        console.log(`[DropWatcher] Image processing not implemented: ${filename}`);
        this.stream.think(`Image detected but vision processing not available: ${filename}`);

        // Basic metadata
        const stats = fs.statSync(filepath);
        await this.vectorMemory.storeMemory(`Image: ${filename}`, {
            metadata: {
                filename,
                source: 'drop_folder',
                file_type: 'image',
                size: stats.size
            },
            source: 'drop_folder',
            type: 'image',
            importance: 5,
            tags: ['image', path.basename(filename, path.extname(filename))]
        });

        return {
            success: true,
            type: 'image',
            note: 'Metadata stored, vision analysis requires additional setup'
        };
    }

    /**
     * Archive processed file
     */
    archiveFile(filepath, filename) {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const archiveFilename = `${timestamp}_${filename}`;
        const archivePath = path.join(this.archivePath, archiveFilename);

        fs.renameSync(filepath, archivePath);
        console.log(`[DropWatcher] Archived: ${filename} -> ${archiveFilename}`);
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            watching: !!this.watcher,
            drop_path: this.dropPath,
            archive_path: this.archivePath,
            processed_count: this.processedFiles.size
        };
    }
}

// Singleton instance
let instance = null;

function getDropWatcher() {
    if (!instance) {
        instance = new DropWatcher();
    }
    return instance;
}

module.exports = {
    DropWatcher,
    getDropWatcher
};
