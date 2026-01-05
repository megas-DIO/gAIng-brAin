param(
    [string]$Workspace = (Get-Location).Path
)

Write-Host "Validating MCP tooling for workspace: $Workspace"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js not found. Install with:"
    Write-Host " winget install OpenJS.NodeJS.LTS"
    exit 1
}

Write-Host "Launching MCP Inspector against filesystem server..."
Write-Host "Close with Ctrl+C when done."

npx -y @modelcontextprotocol/inspector npx -y @modelcontextprotocol/server-filesystem "$Workspace"
