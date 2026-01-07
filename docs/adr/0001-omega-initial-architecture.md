# ADR 0001: OMEGA v0 Architecture Baseline

- Status: Accepted
- Date: 2024-09-14

## Context

OMEGA v0 is intended to be a shared memory brain for distributed AI agents. The platform must
support low-latency memory retrieval, secure multi-tenant access, and an extensible integration
layer for future agent protocols (including MCP).

## Decision

We will implement OMEGA v0 as a Node.js/Express API backed by Supabase (PostgreSQL + pgvector)
with a separate React-based dashboard front-end. The API will expose:

- REST endpoints for health, memory upsert/query, and worker role management.
- MCP (Model Context Protocol) endpoints for LLM integrations.
- Standardized metrics endpoints for health and operational telemetry.

## Rationale

- **Node.js/Express** provides a lightweight, widely-supported HTTP framework with high
  ecosystem velocity.
- **Supabase** offers Postgres + pgvector with managed auth/storage, keeping operational
  complexity low.
- **React** enables a modular status dashboard without coupling to server templating.
- **MCP** aligns with agent tool interoperability across LLM ecosystems.

## Consequences

- The API must maintain strict schema validation for every client interaction.
- Supabase table migrations become the single source of truth for worker and memory schemas.
- The front-end must consume API contracts exposed in OpenAPI and remain decoupled from
  server internals.

## Alternatives Considered

- **Fastify** for API: rejected to avoid refactoring existing Express code.
- **Fully managed vector DB**: rejected to preserve relational context in Postgres.
