# Benjamin Sachwitz Portfolio — Deploy Script
# Double-click in Explorer (Run with PowerShell), or invoke from any shell.
# Anchors to its own folder so it survives further moves of the project.

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ben Sachwitz Portfolio — Deploying..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host ">> Deploying to Vercel (production)..." -ForegroundColor Yellow
vercel deploy --prod --yes

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Done! Check the URL above. Live: https://bensachwitz.vercel.app/" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"
