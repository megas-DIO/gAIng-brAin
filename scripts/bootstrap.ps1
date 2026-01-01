$ErrorActionPreference = "Stop"

Write-Host "== gaing-brain bootstrap ==" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required. Install from https://nodejs.org" -ForegroundColor Red
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is required. Install Node.js which includes npm." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example. Please edit it with your keys." -ForegroundColor Yellow
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "" 
Write-Host "Start the server:" -ForegroundColor Green
Write-Host "  npm start" -ForegroundColor Green

Write-Host "" 
Write-Host "Run ngrok with your static domain:" -ForegroundColor Green
Write-Host "  ngrok http --domain=adjoining-multimolecular-ursula.ngrok-free.dev 3000" -ForegroundColor Green

Write-Host "" 
Write-Host "Test /upsert:" -ForegroundColor Green
Write-Host "  `$env:BRAIN_TOKEN=\"<your-token>\"" -ForegroundColor Green
Write-Host "  `$headers=@{ 'X-BRAIN-TOKEN'=`$env:BRAIN_TOKEN; 'Content-Type'='application/json' }" -ForegroundColor Green
Write-Host "  `$body=@{ author='system'; kind='fact'; content='Hello'; tags=@('boot') } | ConvertTo-Json" -ForegroundColor Green
Write-Host "  curl -Method Post -Headers `$headers -Body `$body https://adjoining-multimolecular-ursula.ngrok-free.dev/upsert" -ForegroundColor Green

Write-Host "" 
Write-Host "Test /query:" -ForegroundColor Green
Write-Host "  `$qbody=@{ query='Hello'; top_k=5 } | ConvertTo-Json" -ForegroundColor Green
Write-Host "  curl -Method Post -Headers `$headers -Body `$qbody https://adjoining-multimolecular-ursula.ngrok-free.dev/query" -ForegroundColor Green
