# Adds Supabase env vars to Vercel Preview (all branches).
# Run after: npx vercel link
# Requires values in .env at repo root.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path .env)) {
  Write-Error ".env not found. Copy .env.example and fill in Supabase values."
}

Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*VITE_SUPABASE_URL=(.+)$') { $url = $matches[1].Trim('"') }
  if ($_ -match '^\s*VITE_SUPABASE_PUBLISHABLE_KEY=(.+)$') { $key = $matches[1].Trim('"') }
}

if (-not $url -or -not $key) {
  Write-Error "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env"
}

Write-Host "Adding Preview env vars (select 'All Preview branches' when prompted)..."
$url | npx vercel env add VITE_SUPABASE_URL preview
$key | npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY preview
Write-Host "Done. Run: npx vercel env ls"
