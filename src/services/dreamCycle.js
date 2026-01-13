/**
 * VIBRANIUM Phase 6: Dream Cycle - Self-Evolution
 *
 * Runs daily at 3 AM to:
 * - Summarize daily thoughts
 * - Extract key learnings
 * - Update system prompts
 * - Clean old memories
 * - Check for updates
 * - Backup state
 */

const { getVectorMemory } = require('./vectorMemory');
const { getThoughtStream } = require('./thoughtStream');
const { VISION_DATA } = require('../config/env');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class DreamCycle {
    constructor() {
        this.vectorMemory = getVectorMemory();
        this.stream = getThoughtStream();
        this.cycleLog = path.join(VISION_DATA, 'dream_cycles.json');
        this.cycles = this.loadCycles();
    }

    loadCycles() {
        if (fs.existsSync(this.cycleLog)) {
            try {
                return JSON.parse(fs.readFileSync(this.cycleLog, 'utf8'));
            } catch (err) {
                console.error('[DreamCycle] Error loading cycle log:', err);
                return [];
            }
        }
        return [];
    }

    saveCycles() {
        fs.writeFileSync(this.cycleLog, JSON.stringify(this.cycles, null, 2));
    }

    async run() {
        console.log('\n=======================================================================');
        console.log('💤 DREAM CYCLE INITIATED');
        console.log('=======================================================================\n');

        const cycleStart = new Date();
        const cycle = {
            id: this.cycles.length + 1,
            started_at: cycleStart.toISOString(),
            steps: {}
        };

        try {
            // Step 1: Summarize daily thoughts
            console.log('📊 Step 1: Summarizing daily thoughts...');
            const thoughtSummary = await this.summarizeDailyThoughts();
            cycle.steps.thought_summary = thoughtSummary;

            // Step 2: Extract key learnings
            console.log('🧠 Step 2: Extracting key learnings...');
            const learnings = await this.extractLearnings();
            cycle.steps.learnings = learnings;

            // Step 3: Update wisdom
            console.log('💡 Step 3: Updating long-term wisdom...');
            const wisdomUpdate = await this.updateWisdom(learnings);
            cycle.steps.wisdom_update = wisdomUpdate;

            // Step 4: Clean old memories
            console.log('🧹 Step 4: Cleaning old memories...');
            const cleanup = await this.cleanOldMemories();
            cycle.steps.cleanup = cleanup;

            // Step 5: Check for updates
            console.log('🔄 Step 5: Checking for updates...');
            const updates = await this.checkUpdates();
            cycle.steps.updates = updates;

            // Step 6: Backup state
            console.log('💾 Step 6: Backing up state...');
            const backup = await this.backupState();
            cycle.steps.backup = backup;

            // Step 7: Optimize databases
            console.log('⚡ Step 7: Optimizing databases...');
            const optimization = await this.optimizeDatabases();
            cycle.steps.optimization = optimization;

            cycle.completed_at = new Date().toISOString();
            cycle.duration_seconds = (new Date() - cycleStart) / 1000;
            cycle.status = 'success';

            console.log('\n✅ Dream cycle completed successfully');
            console.log(`   Duration: ${cycle.duration_seconds.toFixed(2)}s`);

        } catch (error) {
            console.error('\n❌ Dream cycle failed:', error);
            cycle.status = 'failed';
            cycle.error = error.message;
            cycle.completed_at = new Date().toISOString();
        }

        // Save cycle
        this.cycles.push(cycle);
        this.saveCycles();

        // Log to thought stream
        this.stream.learn(`Dream cycle ${cycle.id} completed: ${cycle.status}`, {
            duration: cycle.duration_seconds,
            steps: Object.keys(cycle.steps)
        });

        console.log('\n=======================================================================');
        console.log('😴 DREAM CYCLE COMPLETE - RETURNING TO SLEEP');
        console.log('=======================================================================\n');

        return cycle;
    }

    async summarizeDailyThoughts() {
        const thoughts = this.stream.getRecent(1000);

        if (thoughts.length === 0) {
            return { count: 0, summary: 'No thoughts to summarize' };
        }

        // Group by type
        const byType = {};
        for (const thought of thoughts) {
            byType[thought.type] = (byType[thought.type] || 0) + 1;
        }

        // Find patterns
        const patterns = this.findPatterns(thoughts);

        // Get last 24 hours
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);
        const recent = thoughts.filter(t => new Date(t.timestamp) > cutoff);

        return {
            total_thoughts: thoughts.length,
            last_24h: recent.length,
            by_type: byType,
            patterns,
            notable_thoughts: recent.slice(-10).map(t => ({
                type: t.type,
                content: t.content.substring(0, 100)
            }))
        };
    }

    findPatterns(thoughts) {
        // Simple pattern detection
        const patterns = [];

        // Frequent errors
        const errors = thoughts.filter(t => t.type === 'error');
        if (errors.length > 10) {
            patterns.push({
                type: 'high_error_rate',
                count: errors.length,
                suggestion: 'Review error logs and implement fixes'
            });
        }

        // Decision patterns
        const decisions = thoughts.filter(t => t.type === 'decide');
        if (decisions.length > 20) {
            patterns.push({
                type: 'active_decision_making',
                count: decisions.length,
                suggestion: 'Complex reasoning occurring frequently'
            });
        }

        return patterns;
    }

    async extractLearnings() {
        // Get recent memories with high importance
        const importantMemories = this.vectorMemory.getRecent(100);
        const highImportance = importantMemories.filter(m => m.importance >= 7);

        // Extract unique tags
        const allTags = new Set();
        for (const mem of importantMemories) {
            // Tags would be in a separate query in real implementation
        }

        return {
            high_importance_count: highImportance.length,
            key_concepts: Array.from(allTags).slice(0, 20),
            total_memories: importantMemories.length
        };
    }

    async updateWisdom(learnings) {
        // Store wisdom update in vector memory
        const wisdomText = `Daily wisdom update: Processed ${learnings.total_memories} memories, ` +
            `${learnings.high_importance_count} high-importance items.`;

        const wisdomId = await this.vectorMemory.storeMemory(wisdomText, {
            metadata: {
                cycle: this.cycles.length + 1,
                learnings
            },
            source: 'dream_cycle',
            type: 'wisdom',
            importance: 9,
            tags: ['wisdom', 'dream_cycle', 'learning']
        });

        return {
            wisdom_id: wisdomId,
            updated: true
        };
    }

    async cleanOldMemories() {
        // Delete memories older than 90 days with importance < 5
        const deleted = this.vectorMemory.deleteOldMemories(90, 5);

        return {
            deleted_count: deleted,
            criteria: '90 days old, importance < 5'
        };
    }

    async checkUpdates() {
        const updates = {
            npm: null,
            git: null
        };

        try {
            // Check npm for outdated packages
            const { stdout: npmOutput } = await execAsync('npm outdated --json', {
                cwd: require('path').resolve(__dirname, '../..')
            });
            updates.npm = {
                checked: true,
                outdated: npmOutput ? JSON.parse(npmOutput) : {}
            };
        } catch (err) {
            updates.npm = { checked: true, error: 'No outdated packages or error checking' };
        }

        try {
            // Check git for updates
            await execAsync('git fetch');
            const { stdout: gitStatus } = await execAsync('git status -sb');
            updates.git = {
                checked: true,
                status: gitStatus.trim()
            };
        } catch (err) {
            updates.git = { checked: true, error: err.message };
        }

        return updates;
    }

    async backupState() {
        const backupDir = path.join(VISION_DATA, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupPath = path.join(backupDir, `backup_${timestamp}.json`);

        // Export vector memory
        const memoryExport = this.vectorMemory.exportAll();

        // Export thought stream
        const streamExport = {
            thoughts: this.stream.getRecent(5000),
            stats: this.stream.getStats()
        };

        const backup = {
            timestamp,
            memory: memoryExport,
            stream: streamExport,
            cycles: this.cycles
        };

        fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

        // Keep only last 7 backups
        const backups = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('backup_'))
            .sort()
            .reverse();

        for (let i = 7; i < backups.length; i++) {
            fs.unlinkSync(path.join(backupDir, backups[i]));
        }

        return {
            backup_path: backupPath,
            size_mb: (fs.statSync(backupPath).size / (1024 * 1024)).toFixed(2),
            backups_kept: Math.min(7, backups.length)
        };
    }

    async optimizeDatabases() {
        // SQLite VACUUM command to optimize database
        try {
            this.vectorMemory.db.exec('VACUUM');
            this.vectorMemory.db.exec('ANALYZE');

            return {
                optimized: true,
                operations: ['VACUUM', 'ANALYZE']
            };
        } catch (err) {
            return {
                optimized: false,
                error: err.message
            };
        }
    }

    getLastCycle() {
        return this.cycles[this.cycles.length - 1] || null;
    }

    getCycleStats() {
        return {
            total_cycles: this.cycles.length,
            successful: this.cycles.filter(c => c.status === 'success').length,
            failed: this.cycles.filter(c => c.status === 'failed').length,
            last_cycle: this.getLastCycle()
        };
    }
}

// Singleton instance
let instance = null;

function getDreamCycle() {
    if (!instance) {
        instance = new DreamCycle();
    }
    return instance;
}

// CLI execution
if (require.main === module) {
    const dreamCycle = getDreamCycle();
    dreamCycle.run().then(cycle => {
        console.log('\nCycle summary:', JSON.stringify(cycle, null, 2));
        process.exit(cycle.status === 'success' ? 0 : 1);
    }).catch(err => {
        console.error('Dream cycle crashed:', err);
        process.exit(1);
    });
}

module.exports = {
    DreamCycle,
    getDreamCycle
};
