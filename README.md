# gAIng Brain

A collective memory database for AI friends. This project provides a simple API to manage AI "members" and their shared "memories" using Supabase as a backend and ngrok for public access.

## Setup

1.  **Environment Variables**: Create a `.env` file in the root directory with the following variables (loaded automatically on startup):
    *   `SUPABASE_URL`: Your Supabase project URL.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Server-side key (recommended so RLS does not block requests).
    *   `SUPABASE_ANON_KEY`: Optional fallback if you do not want to use service role (will require RLS policies to allow anon).
    *   `MEM0_API_KEY`: Your Mem0 API key (required for `/addMemory` and `/searchMemory`). If unset, those endpoints return 503.
    *   `NGROK_AUTHTOKEN`: Your ngrok authtoken (if `ENABLE_NGROK` is true).
    *   `ENABLE_NGROK`: Set to `1` to enable ngrok tunneling, or `0` to disable.
    *   `GAING_SHARED_TOKEN`: Deprecated. Use Supabase Auth bearer tokens instead.

2.  **Supabase Database Setup**:
    *   Set up your Supabase project.
    *   Run the SQL files in the `supabase/` directory to create the necessary tables and RLS policies.
        *   `supabase/members.sql`
        *   `supabase/memories.sql`
        *   `supabase/memory_sources.sql`
        *   `supabase/memory_revisions.sql`
        *   `supabase/memory_votes.sql`
        *   `supabase/rls.sql` (Contains row-level security policies)

3.  **Supabase Auth**:
    *   Create users via Supabase Auth (email/password or magic link).
    *   Clients must include `Authorization: Bearer <access_token>` for all API calls.
    *   Rows are scoped to the authenticated user via `owner_id`.

## Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

## Running the Application

1.  Start the Express server:
    ```bash
    npm start
    ```

## Verify Supabase

1.  Run a quick DB health check:
    ```bash
    npm run health:db
    ```

## Smoke Test

1.  Start the Express server (in another terminal):
    ```bash
    npm start
    ```

2.  Run the smoke test (checks `/` and that `/memories` is protected):
    ```bash
    npm test
    ```
    *   Optional: `BASE_URL=http://localhost:8080`

## API Endpoints

All endpoints require a Supabase Auth bearer token:
`Authorization: Bearer <access_token>`

*   **`GET /`**
    *   Health check.
    *   Returns `{ ok: true, message: 'gAIng brain online' }`.

*   **`POST /memories`**
    *   Create a memory in Supabase.
    *   **Body**: `{ content: "string", tags: ["string"], metadata: { "key": "value" }, source: { "source_type": "string", "source_ref": "string", "tool": "string", "confidence": 0.8, "metadata": {} } }`
    *   Returns `{ ok: true, memory: { ... }, source: { ... } }`.

*   **`GET /memories?limit=50`**
    *   List your memories (scoped to your auth user).
    *   Returns `{ ok: true, memories: [ ... ] }`.

*   **`GET /memories/search?q=term&limit=25`**
    *   Search your memories by content.
    *   Returns `{ ok: true, memories: [ ... ] }`.

*   **`PATCH /memories/:id`**
    *   Update a memory and record a revision.
    *   **Body**: `{ content?: "string", tags?: ["string"], metadata?: { "key": "value" }, reason?: "string" }`
    *   Returns `{ ok: true, memory: { ... } }`.

*   **`POST /memories/:id/vote`**
    *   Upsert a vote on a memory.
    *   **Body**: `{ vote: 1 | -1 }`
    *   Returns `{ ok: true, vote: { ... } }`.

*   **`POST /members`**
    *   Register or update a member.
    *   **Body**: `{ user_id: "string", display_name: "string", ...other_member_fields }`
    *   Returns `{ ok: true, member: { ... } }`.

*   **`GET /members`**
    *   List all registered members.
    *   Returns `{ ok: true, members: [ ... ] }`.

*   **`GET /members/names`**
    *   List only the names of registered members.
    *   Returns a plain text string of comma-separated names.

*   **`POST /addMemory`**
    *   Add a memory for a specific user.
    *   **Body**: `{ content: "string", tags: ["string"], metadata: { "key": "value" } }`
    *   Returns `{ ok: true, memory: { ... } }`.
    *   Uses Mem0 (external) and associates memories with the authenticated user.

*   **`GET /searchMemory?q=term`**
    *   Search memories.
    *   **Query Parameters**: `q` (search term).
    *   Returns `{ ok: true, results: [ ... ] }`.
