# MCP Server Configuration

This directory contains the Model Context Protocol (MCP) configuration for the gAIng-brAin API.

## Files

- `config.json`: Canonical MCP server metadata and tool declarations used by clients.

## Usage

1. Start the API server.
2. Use the `/mcp` endpoint with a unique `mcp-session-id` header per client session.
3. Fetch `/mcp/info` to retrieve the server metadata for configuration or discovery.

## Authentication

MCP requests require the same `X-BRAIN-TOKEN` header as other authenticated API endpoints.
