# Testar molnsparningen. Kör i PowerShell i mappen "Kupp Server":
#   powershell -ExecutionPolicy Bypass -File .\test-api.ps1
$base = "http://localhost:8080/api"
Write-Host "1. Hälsokontroll..." -ForegroundColor Cyan
Invoke-RestMethod "$base/health"

Write-Host "2. PUT (spara)..." -ForegroundColor Cyan
$body = @{ savedAt = 1; data = "test från PowerShell" } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri "$base/save/TESTKOD1" -ContentType "application/json" -Body $body

Write-Host "3. GET (hämta)..." -ForegroundColor Cyan
Invoke-RestMethod "$base/save/TESTKOD1"

Write-Host "4. DELETE (ta bort)..." -ForegroundColor Cyan
Invoke-RestMethod -Method Delete -Uri "$base/save/TESTKOD1"

Write-Host "5. GET igen (ska ge 404 = borta)..." -ForegroundColor Cyan
try { Invoke-RestMethod "$base/save/TESTKOD1" } catch { Write-Host "OK: $($_.Exception.Response.StatusCode.value__) – sparningen är borttagen" -ForegroundColor Green }

Write-Host "6. Sparningar i databasen just nu:" -ForegroundColor Cyan
docker compose exec -T db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB -c ''SELECT id, saved_at, length(data) AS bytes, updated FROM saves ORDER BY updated DESC'''
