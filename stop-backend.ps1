# PowerShell script to stop all running Java processes (microservices)

Write-Host "Stopping all java processes..." -ForegroundColor Red
Stop-Process -Name java -Force -ErrorAction SilentlyContinue
Write-Host "All Java processes stopped." -ForegroundColor Green
