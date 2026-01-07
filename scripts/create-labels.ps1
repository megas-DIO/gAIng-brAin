$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "gh CLI is required. Install https://cli.github.com/"
}

$labels = @(
  @{ Name = "priority:critical"; Color = "d73a4a" },
  @{ Name = "priority:high"; Color = "f9d0c4" },
  @{ Name = "priority:medium"; Color = "fbca04" },
  @{ Name = "priority:low"; Color = "c2e0c6" },
  @{ Name = "type:feature"; Color = "0e8a16" },
  @{ Name = "type:bug"; Color = "d73a4a" },
  @{ Name = "type:docs"; Color = "0075ca" },
  @{ Name = "type:chore"; Color = "cfd3d7" },
  @{ Name = "type:ci"; Color = "5319e7" },
  @{ Name = "area:api"; Color = "1d76db" },
  @{ Name = "area:frontend"; Color = "e99695" },
  @{ Name = "area:mcp"; Color = "b60205" },
  @{ Name = "area:database"; Color = "0052cc" },
  @{ Name = "area:infra"; Color = "5319e7" },
  @{ Name = "status:needs-triage"; Color = "ededed" },
  @{ Name = "status:in-progress"; Color = "0052cc" },
  @{ Name = "status:blocked"; Color = "d73a4a" },
  @{ Name = "status:ready-for-review"; Color = "0e8a16" }
)

foreach ($label in $labels) {
  gh label create $label.Name --color $label.Color --force | Out-Null
  Write-Host "Ensured label $($label.Name)"
}
