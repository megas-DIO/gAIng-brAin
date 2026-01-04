const { spawn } = require(''child_process'');
const blackboard = require(''../services/blackboard'');
const Mission = require(''./mission'');
const { planner } = require(''../workers'');

class Brain {
    constructor() {
        this.isProcessing = false;
        this.taskQueue = [];
        this.activeMission = null;
    }

    async awaken() {
        console.log(''[Brain] Awakening...'');
        blackboard.init();
        blackboard.broadcast(''AWAKE'', ''Vision is online. Listening for signals.'');

        // Bind Signals
        blackboard.on(''command'', (cmd) => this.handleCommand(cmd));
        blackboard.on(''user_msg'', (msg) => this.handleThought(msg));

        console.log(''[Brain] Core logic active. Waiting for input.'');
    }

    // Handle explicit shell commands from log.md
    async handleCommand(command) {
        console.log(`[Brain] Executing: ${command}`);
        blackboard.broadcast(''ACTING'', `Executing: ${command}`);

        this.executeShell(command);
    }

    // Handle abstract thoughts or chat -> OMEGA PIPELINE
    async handleThought(msg) {
        console.log(`[Brain] Pondering: ${msg}`);
        blackboard.broadcast(''THINKING'', `Analyzing request: ${msg}`);

        // 1. Create Mission
        this.activeMission = new Mission(msg);
        blackboard.write(`MISSION STARTED [${this.activeMission.id}]: ${msg}`);
        
        // 2. Plan Mission (The Planner)
        this.activeMission.setStatus(''PLANNING'');
        const planResult = await planner.execute(this.activeMission);

        if (planResult.success) {
            blackboard.broadcast(''PLAN_READY'', `Created ${this.activeMission.steps.length} step plan.`);
            
            let planText = `\n## PLAN: ${msg}\n`;
            this.activeMission.steps.forEach(s => {
                planText += `- [ ] [${s.agent}] ${s.instruction}\n`;
            });
            blackboard.write(planText);
            
            // TODO: In v0.1, we will auto-execute. For now, we wait for user confirmation.
            blackboard.broadcast(''IDLE'', ''Plan created. Waiting for GO.'');
        } else {
            blackboard.broadcast(''ERROR'', `Planning failed: ${planResult.error}`);
            blackboard.write(`PLANNING FAILED: ${planResult.error}`);
        }
    }

    // execute command in the host shell
    executeShell(cmd) {
        // Use Antigravity tools if available
        const shell = process.platform === ''win32'' ? ''powershell.exe'' : ''bash'';
        const args = process.platform === ''win32'' ? [''-Command'', cmd] : [''-c'', cmd];

        const proc = spawn(shell, args);

        proc.stdout.on(''data'', (data) => {
            const output = data.toString().trim();
            console.log(`[Shell] ${output}`);
        });

        proc.stderr.on(''data'', (data) => {
            console.error(`[Shell Error] ${data}`);
        });

        proc.on(''close'', (code) => {
            console.log(`[Shell] Exited with code ${code}`);
            blackboard.broadcast(''IDLE'', `Command finished (Exit: ${code})`);
            blackboard.write(`Executed: ${cmd} (Exit: ${code})`);
        });
    }
}

module.exports = new Brain();
