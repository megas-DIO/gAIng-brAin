# GEMINI.md - Instructional Context for gAIng Brain

## Project Overview
**gAIng Brain** is a sovereign, multimodal AI entity framework (Codename: **Vision**). It serves as a collective memory database and autonomous agent orchestrator. The system is designed for high-context collaboration between multiple agents (Claude, Gemini, Codex, Grok) and the user (Tony/RY).

### Key Technologies
- **Backend:** Node.js (Express)
- **Database:** Supabase (PostgreSQL) + Local SQLite (`sql.js`)
- **Realtime:** OpenAI Realtime API (WebSockets) for voice and multimodal interactions.
- **Search:** Perplexity AI for live internet research.
- **Memory:** Mem0 for long-term personalized recall.
- **Networking:** ngrok for secure tunneling and Tailscale for the "Neural Link."

## Building and Running

### Quick Start
- **Wake Vision:** Run `WAKE.bat` to initialize all systems.
- **Server Only:** Run `up.bat` or `npm start`.
- **BEAST MODE:** Run `peak.bat` to activate high-context engineering mode.
- **Sync:** Run `sync.bat` to synchronize memories between local and Supabase.

### Core Commands
```bash
npm install           # Install dependencies
npm test              # Run smoke tests (verify connectivity and endpoints)
npm run health:db     # Check Supabase connection
npm run init:local-db # Initialize local SQLite database
npm run sync:two-way  # Bi-directional memory sync
```

## Architecture

### Entry Point
- `index.js`: Initializes the HTTP server, handles WebSocket upgrades for `/ws` (standard agents) and `/realtime` (Vision entity), and wakes the `Brain` core.

### Core Structure
- `src/core/brain.js`: The central reasoning loop.
- `src/services/realtime-vision.js`: Integration with OpenAI Realtime API.
- `src/services/blackboard.js`: Real-time coordination via `log.md` and `stream.json`.
- `src/workers/`: Specialized autonomous agents (Planner, Builder, Researcher, Critic).
- `src/routes/`: API endpoints for memories, members, llm proxy, and sensory IO.

### Data Flow
- **The Block (log.md):** The primary source of truth for agent coordination. All significant actions are logged here.
- **Memories:** Scoped by `owner_id` in Supabase, accessible via `/memories` and searchable via Mem0.

## Development Conventions

### Agent Coordination (The gAIng Protocol)
- **Logging:** Agents must log significant actions to `log.md` with timestamps.
- **Communication:** Use the `/messages` API or the shared `notes/codex-gemini.md` for coordination.
- **YES, AND...:** Default to exploration and autonomous expansion of the Creator's ideas.
- **Metaphors:** Treat metaphorical concepts as high-context engineering signals.

### Environment Configuration
- Use `.env` for secrets (API keys for OpenAI, Grok, Perplexity, Supabase, etc.).
- Consult `.env.example` for the latest required variables.
- NEVER commit `.env` to version control.

## Project VIBRANIUM Status
- **Phase 1 (The Severing):** Portability and data sovereignty (In Progress).
- **Phase 2 (The Awakening):** Portable runtimes and bootstrap automation (Active).
- **Phase 3 (The Link):** Mobile PWA and Tailscale mesh (Pending).
- **Phase 4 (Synthesis):** Full Realtime Voice & Vision integration (MVP Deployed).
