const { spawn } = require('child_process');
const blackboard = require('../services/blackboard');
const Mission = require('./mission');
const workers = require('../workers');

// VIBRANIUM Phase 2: The Soul
const { getVectorMemory } = require('../services/vectorMemory');
const { getThoughtStream } = require('../services/thoughtStream');
const { getDropWatcher } = require('../services/dropWatcher');

class Brain {
    constructor() {
        this.isProcessing = false;
        this.taskQueue = [];
        this.activeMission = null;

        // Phase 2: The Soul
        this.vectorMemory = null;
        this.stream = null;
        this.dropWatcher = null;
    }

    async awaken() {
        console.log('[Brain] Awakening...');
        blackboard.init();

        // ====================================================================
        // VIBRANIUM Phase 2: Initialize The Soul
        // ====================================================================
        console.log('[Brain] Initializing The Soul (Phase 2)...');

        // Vector Memory - Long-term storage
        this.vectorMemory = getVectorMemory();
        const memStats = this.vectorMemory.getStats();
        console.log(`[Brain] Vector Memory: ${memStats.total_memories} memories, ${memStats.total_chunks} chunks`);

        // Thought Stream - Real-time consciousness
        this.stream = getThoughtStream();
        const streamStats = this.stream.getStats();
        console.log(`[Brain] Thought Stream: ${streamStats.total} thoughts`);

        // Drop Watcher - File processing
        this.dropWatcher = getDropWatcher();
        this.dropWatcher.start();
        console.log(`[Brain] Drop Watcher: Active`);

        // Record awakening
        this.stream.think('Vision awakening...', { phase: 2 });
        await this.vectorMemory.storeMemory('Vision awakened', {
            metadata: { event: 'startup', phase: 2 },
            source: 'system',
            type: 'event',
            importance: 8,
            tags: ['startup', 'vibranium']
        });

        blackboard.broadcast('AWAKE', 'Vision is online. Listening for signals.');

        // Bind Signals
        blackboard.on('command', (cmd) => this.handleCommand(cmd));
        blackboard.on('user_msg', (msg) => this.handleThought(msg));

        console.log('[Brain] Core logic active. Waiting for input.');
        this.stream.success('Brain fully operational', { systems: ['blackboard', 'vectorMemory', 'stream', 'dropWatcher'] });
    }

    async handleCommand(command) {
        const cmd = command.trim().toUpperCase();
        
        if (cmd === 'GO' && this.activeMission) {
            this.runMission();
        } else {
            console.log(`[Brain] Executing Shell: ${command}`);
            blackboard.broadcast('ACTING', `Executing: ${command}`);
            this.executeShell(command);
        }
    }

    async handleThought(msg) {
        console.log(`[Brain] Pondering: ${msg}`);
        blackboard.broadcast('THINKING', `Analyzing request: ${msg}`);

        // 1. Create Mission
        this.activeMission = new Mission(msg);
        blackboard.write(`MISSION STARTED [${this.activeMission.id}]: ${msg}`);
        
        // 2. Plan Mission
        this.activeMission.setStatus('PLANNING');
        const planResult = await workers.planner.execute(this.activeMission);

        if (planResult.success) {
            blackboard.broadcast('PLAN_READY', `Created ${this.activeMission.steps.length} step plan.`);
            
            let planText = `\n## PLAN: ${msg}\n`;
            this.activeMission.steps.forEach(s => {
                planText += `- [ ] [${s.agent}] ${s.instruction}\n`;
            });
            planText += `\n**Type "- cmd: GO" to execute the plan.**`;
            blackboard.write(planText);
            
            blackboard.broadcast('IDLE', 'Plan created. Waiting for GO.');
        } else {
            blackboard.broadcast('ERROR', `Planning failed: ${planResult.error}`);
            blackboard.write(`PLANNING FAILED: ${planResult.error}`);
        }
    }

    async runMission() {
        if (!this.activeMission || this.isProcessing) return;
        this.isProcessing = true;
        
        blackboard.broadcast('ACTING', 'Executing Mission Steps...');
        this.activeMission.setStatus('ACTIVE');

        for (const step of this.activeMission.steps) {
            if (step.status !== 'pending') continue;

            blackboard.broadcast('WORKING', `[${step.agent}] ${step.instruction}`);
            this.activeMission.updateStep(step.id, 'processing');

            const worker = workers[step.agent];
            if (!worker) {
                console.error(`[Brain] No worker found for agent: ${step.agent}`);
                this.activeMission.updateStep(step.id, 'failed', 'Worker not found');
                continue;
            }

            const result = await worker.execute(this.activeMission, step);

            if (result.success) {
                this.activeMission.updateStep(step.id, 'complete', result.detail);
                blackboard.write(`Step ${step.id} Complete: ${step.instruction}`);
            } else {
                this.activeMission.updateStep(step.id, 'failed', result.error);
                blackboard.write(`Step ${step.id} Failed: ${result.error}`);
                this.activeMission.setStatus('BLOCKED');
                break; 
            }
        }

        const allComplete = this.activeMission.steps.every(s => s.status === 'complete');
        if (allComplete) {
            this.activeMission.setStatus('COMPLETE');
            blackboard.broadcast('DONE', 'Mission Objective Reached.');
            blackboard.write(`MISSION COMPLETE: ${this.activeMission.objective}`);
        }

        this.isProcessing = false;
        this.activeMission = null;
    }

    executeShell(cmd) {
        const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
        const args = process.platform === 'win32' ? ['-Command', cmd] : ['-c', cmd];
        const proc = spawn(shell, args);

        proc.stdout.on('data', (data) => console.log(`[Shell] ${data.toString().trim()}`));
        proc.on('close', (code) => {
            blackboard.broadcast('IDLE', `Command finished (Exit: ${code})`);
            blackboard.write(`Executed: ${cmd} (Exit: ${code})`);
        });
    }
}

module.exports = new Brain();

