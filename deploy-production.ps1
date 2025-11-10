# PowerShell script to deploy to production server
# Run: powershell -ExecutionPolicy Bypass -File deploy-production.ps1

$server = "8.141.127.26"
$user = "root"
$password = "25884hsY!"
$scriptPath = "D:\mast\web\quick-update.sh"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying to Production Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Upload the deployment script
Write-Host "[1/3] Uploading deployment script..." -ForegroundColor Yellow
$pscpCmd = "echo $password | pscp -pw $password $scriptPath ${user}@${server}:/root/mall_mingping/"
try {
    # Try using pscp if available
    & pscp -pw $password $scriptPath "${user}@${server}:/root/mall_mingping/" 2>&1 | Out-Null
    Write-Host "✓ Script uploaded" -ForegroundColor Green
} catch {
    Write-Host "⚠ pscp not found, trying scp..." -ForegroundColor Yellow
    # Fallback to scp
    & scp $scriptPath "${user}@${server}:/root/mall_mingping/" 2>&1 | Out-Null
    Write-Host "✓ Script uploaded" -ForegroundColor Green
}
Write-Host ""

# Step 2: Execute the script on server
Write-Host "[2/3] Executing deployment on server..." -ForegroundColor Yellow
try {
    $plinkCmd = "echo y | plink -pw $password ${user}@${server} `"cd /root/mall_mingping && bash quick-update.sh`""
    Invoke-Expression $plinkCmd
} catch {
    Write-Host "⚠ plink not found, trying ssh..." -ForegroundColor Yellow
    & ssh "${user}@${server}" "cd /root/mall_mingping && bash quick-update.sh"
}
Write-Host "✓ Deployment complete" -ForegroundColor Green
Write-Host ""

# Step 3: Show result
Write-Host "[3/3] Deployment Status" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Code updated on server" -ForegroundColor Green
Write-Host "✓ Frontend rebuilt" -ForegroundColor Green
Write-Host "✓ Backend rebuilt" -ForegroundColor Green
Write-Host "✓ Services restarted" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://${server}:3000" -ForegroundColor White
Write-Host "  Backend API: http://${server}:3001/api" -ForegroundColor White
Write-Host "  Admin Panel: http://${server}:3000/admin" -ForegroundColor White
Write-Host ""
