# gaing-brain

A shared memory system for multiple AI agents. Provides:

- REST API + OpenAPI spec for ChatGPT Actions.
- MCP Streamable HTTP endpoint for Claude tools.
- Supabase (Postgres + pgvector) backend.
- Optional OpenAI embeddings (or EMBED_PROVIDER=none for free mode).

## Requirements

- Windows 11 + PowerShell
- Node.js 18+ (https://nodejs.org)
- Supabase project with `public.memories` table and `match_memories` RPC already created
- ngrok installed (https://ngrok.com)

## Quick Start (PowerShell)

```powershell
# 1) Install deps
npm install

# 2) Create .env from example (if needed)
Copy-Item .env.example .env -ErrorAction SilentlyContinue

# 3) Edit .env with your Supabase + tokens
notepad .env

# 4) Run the server
npm start
```

Server will listen on `http://localhost:3000` by default.

## Run ngrok (static domain)

```powershell
ngrok http --domain=adjoining-multimolecular-ursula.ngrok-free.dev 3000
```

## REST API (cURL tests)

Replace `$env:BRAIN_TOKEN` with one of the values from `BRAIN_TOKENS`.

```powershell
# Health check
curl https://adjoining-multimolecular-ursula.ngrok-free.dev/health

# Upsert
$env:BRAIN_TOKEN = "local-dev-token"
$headers = @{ "X-BRAIN-TOKEN" = $env:BRAIN_TOKEN; "Content-Type" = "application/json" }
$body = @{
  author = "system"
  kind = "fact"
  title = "First memory"
  content = "Supabase is connected."
  tags = @("boot")
  confidence = 0.9
  pinned = $false
} | ConvertTo-Json
curl -Method Post -Headers $headers -Body $body https://adjoining-multimolecular-ursula.ngrok-free.dev/upsert

# Query
$qbody = @{ query = "Supabase"; top_k = 5 } | ConvertTo-Json
curl -Method Post -Headers $headers -Body $qbody https://adjoining-multimolecular-ursula.ngrok-free.dev/query
```

## ChatGPT Actions

1. In ChatGPT, create a new Action.
2. Use `openapi.yaml` as the spec.
3. Set auth header `X-BRAIN-TOKEN` to one of your `BRAIN_TOKENS` values.
4. Use the base URL `https://adjoining-multimolecular-ursula.ngrok-free.dev`.

## Claude MCP (Streamable HTTP)

- Endpoint: `https://adjoining-multimolecular-ursula.ngrok-free.dev/mcp`
- Required header: `X-BRAIN-TOKEN` or `Authorization: Bearer <token>`
- Include an `mcp-session-id` header per session.

Tools:
- `brain_query({query, top_k?, threshold?, tags?})` -> returns JSON string
- `brain_upsert({id?, author, kind, title?, content, tags?, confidence?, pinned?})` -> returns JSON string

## Configuration

All configuration lives in `.env`.

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: Supabase project credentials.
- `BRAIN_TOKENS`: Comma-separated tokens accepted by `X-BRAIN-TOKEN` or `Authorization: Bearer`.
- `EMBED_PROVIDER`: `openai` or `none`.
- `OPENAI_API_KEY`: Required if `EMBED_PROVIDER=openai`.
- `OPENAI_EMBED_MODEL`: Defaults to `text-embedding-3-small`.
- `ALLOWED_HOSTS`: Comma-separated hostnames allowed (DNS rebinding protection).
- `ALLOWED_ORIGINS`: Comma-separated origins for CORS.
- `PORT`: Server port.

## Local Bootstrap Script

```powershell
./scripts/bootstrap.ps1
```
