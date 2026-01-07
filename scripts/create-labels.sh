#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Install https://cli.github.com/" >&2
  exit 1
fi

labels=(
  "priority:critical:#d73a4a"
  "priority:high:#f9d0c4"
  "priority:medium:#fbca04"
  "priority:low:#c2e0c6"
  "type:feature:#0e8a16"
  "type:bug:#d73a4a"
  "type:docs:#0075ca"
  "type:chore:#cfd3d7"
  "type:ci:#5319e7"
  "area:api:#1d76db"
  "area:frontend:#e99695"
  "area:mcp:#b60205"
  "area:database:#0052cc"
  "area:infra:#5319e7"
  "status:needs-triage:#ededed"
  "status:in-progress:#0052cc"
  "status:blocked:#d73a4a"
  "status:ready-for-review:#0e8a16"
)

for entry in "${labels[@]}"; do
  IFS=":" read -r namespace name color <<<"${entry}"
  full_name="${namespace}:${name}"
  gh label create "${full_name}" --color "${color}" --force
  echo "Ensured label ${full_name}"
done
