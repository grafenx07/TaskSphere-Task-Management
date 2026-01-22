# Test your Railway backend
# Replace with your actual Railway URL

$backendUrl = "https://tasksphere-backend-production-XXXX.up.railway.app"

Write-Host "`nTesting Backend Health Check..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get
    Write-Host "`n✅ Backend is healthy!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "`n❌ Backend health check failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nYour backend URL is: $backendUrl" -ForegroundColor Yellow
Write-Host "Copy this URL for Vercel frontend deployment!`n" -ForegroundColor Cyan
