$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."
docker compose up -d --build
Write-Host "Prelegal running at http://localhost:8000"
