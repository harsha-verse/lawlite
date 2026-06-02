# Push [auth] redirect URLs from supabase/config.toml to your Supabase project.
# Prerequisite: npx supabase login

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

npx supabase link --project-ref puazenbfwexapuofrarh
npx supabase config push
Write-Host "Supabase auth URLs updated. Verify in Dashboard -> Authentication -> URL Configuration."
