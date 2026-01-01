# gAIng Brain (free, no semantic by default)

This repo runs a local Brain API that lets tools and agents read and write shared memories stored in Supabase.

## What you get
- REST endpoints for ChatGPT Actions:
  - POST /query
  - POST /upsert
- MCP Streamable HTTP endpoint for Claude:
  - /mcp
- Auth: X-BRAIN-TOKEN (or Authorization: Bearer)
- Rate limiting + input validation

## Run locally (WSL Ubuntu)
1) Copy env file and fill in Supabase secrets:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Required:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - BRAIN_TOKENS (comma-separated)

2) Install deps and run:
   ```bash
   npm install
   npm start
   ```

3) Health check:
   ```bash
   curl http://localhost:3000/health
   ```

## Public URL via ngrok (static domain)
Run ngrok (either in Windows or WSL) to expose port 3000:

```bash
ngrok http --domain=adjoining-multimolecular-ursula.ngrok-free.dev 3000
```

Public endpoints:
- https://adjoining-multimolecular-ursula.ngrok-free.dev/health
- https://adjoining-multimolecular-ursula.ngrok-free.dev/query
- https://adjoining-multimolecular-ursula.ngrok-free.dev/upsert
- https://adjoining-multimolecular-ursula.ngrok-free.dev/mcp

## ChatGPT Actions
Import `openapi.yaml` into your Custom GPT Actions.
Auth:
- API key header: `X-BRAIN-TOKEN`

## Claude MCP
Configure Claude MCP server:
- URL: https://adjoining-multimolecular-ursula.ngrok-free.dev/mcp
- Header: X-BRAIN-TOKEN: <token>

## Semantic search (optional)
If you later want semantic search:
- set `EMBED_PROVIDER=openai` and add `OPENAI_API_KEY`
- ensure your `match_memories` RPC returns a similarity score
