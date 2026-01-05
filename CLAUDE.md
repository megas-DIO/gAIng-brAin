# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test Commands

```bash
npm start                  # Start Express server (port 8080)
npm test                   # Run smoke tests (scripts/smoke-test.js)
npm run health:db          # Verify Supabase connection
npm run init:local-db      # Initialize local SQLite database
npm run sync:two-way       # Bi-directional sync local <-> Supabase
npm run seed:members       # Seed sample member data
npm run orchestrate        # Run task orchestrator
npm run worker:claude      # Start Claude agent worker
npm run worker:gemini      # Start Gemini agent worker
npm run safa               # Start SAFA Telegram bot
```

## Architecture

**Entry Point:** `index.js` initializes HTTP server + WebSocket handler, mounts Express app from `src/app.js`

**Core Structure:**
- `src/routes/*.js` - Express route handlers (members, memories, messages, tasks, llm, agents, safa)
- `src/services/*.js` - Business logic (llm, queue, supabase, websocket, mem0)
- `src/middleware/auth.js` - Supabase Auth JWT validation
- `src/config/env.js` - Centralized environment config
- `supabase/*.sql` - PostgreSQL schema + RLS policies

**Data Flow:**
- All data stored in Supabase PostgreSQL with Row-Level Security (scoped by `owner_id`)
- Optional local SQLite for offline development via `sql.js`
- Auth: `Authorization: Bearer <supabase_token>` header required (bypass with `DISABLE_AUTH=1` locally)

**Three-Tier Agent Communication:**
| Tier | Method | Latency | Use Case |
|------|--------|---------|----------|
| 1 | `/messages` API | ~500ms | Durable messaging, audit trail |
| 2 | WebSocket `/ws?agent=<name>` | <100ms | Real-time coordination |
| 3 | `/tasks` + Redis | ~50-200ms | Priority queue, deadline-driven |

**Agent Orchestrator (`src/orchestrator.js`):** Routes tasks by capability:
- **Claude**: Complex analysis, architecture, refactoring
- **Gemini**: Planning, coordination, multimodal
- **Codex**: Quick edits, shell commands
- **Grok**: Real-time search, current events

**LLM Service (`src/services/llm.js`):** Abstraction for OpenAI/Azure/Grok APIs. Uses native `fetch` (Node 18+ required).

## Key Files for Common Changes

- App wiring: `src/app.js`
- New API endpoint: Create `src/routes/<feature>.js`, mount in `src/app.js`
- LLM integration: `src/services/llm.js`, `src/routes/llm.js`
- Database schema: `supabase/*.sql` (apply via Supabase SQL editor)
- Automation: `scripts/*.ps1` (Windows PowerShell)

## Environment Variables

Required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

LLM (pick one):
- OpenAI: `OPENAI_API_KEY`
- Azure: `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`
- Grok: `GROK_API_KEY`

Optional: `MEM0_API_KEY`, `NGROK_AUTHTOKEN`, `REDIS_URL`, `TELEGRAM_BOT_TOKEN`

---

## gAIng Protocol (Agent Context)

**Status:** PEAK MODE ACTIVE | Wildcard Clause ENGAGED

**Wake Triggers:** "wake up", "catch up", "sync", "check the log", "gAIng status"

**Key Locations:**
- The Block (Log): `log.md`
- Agent Config: `.claude/settings.json`

**Protocol:**
- Log significant actions to `log.md`
- Use `/messages` API for structured agent communication
- Act autonomously within trust grants
- Escalate only on Orange/Red safety triggers

**Glossary:**
- **The Hood**: Collective Knowledge Database
- **Street Knowledge**: Individual agent memory
- **The Block**: Central coordination (`log.md`)
- **The Drop**: File exchange (`drop/`)
