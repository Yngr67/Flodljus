# Uppdaterar Flodljus Manager på servern till senaste versionen från GitHub.
#
#   cd "C:\Users\peter\Kupp Server"
#   powershell -ExecutionPolicy Bypass -File .\flodljus\uppdatera.ps1
#
# Skriptet avbryter hellre än lämnar dig med ett trasigt spel: misslyckas ett
# steg fortsätter versionen som redan körs att fungera.

$ErrorActionPreference = 'Continue'
$repo   = $PSScriptRoot
$server = Split-Path $repo -Parent

function Say($t)  { Write-Host "`n$t" -ForegroundColor Cyan }
function Fail($t) { Write-Host "`n$t" -ForegroundColor Red; exit 1 }

# ── Kontroller innan något ändras ────────────────────────────────────
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail "git saknas. Installera Git for Windows: https://git-scm.com/download/win"
}
if (-not (Test-Path (Join-Path $repo '.git'))) {
  Fail "Mappen $repo är inte hämtad med git. Se UPPDATERA.md, steg 2."
}

Set-Location $repo
if (git status --porcelain) {
  Fail "Någon fil i flodljus-mappen har ändrats för hand. Avbryter för att inte skriva över den."
}

# ── 1. Hämta ─────────────────────────────────────────────────────────
$before = git rev-parse HEAD
Say "1/3  Hämtar senaste versionen från GitHub..."
git pull --ff-only
if ($LASTEXITCODE) { Fail "Kunde inte hämta. Kontrollera internet och försök igen. Inget har ändrats." }
$after = git rev-parse HEAD

if ($before -eq $after) {
  Say "Du har redan senaste versionen. Inget att göra."
  exit 0
}
$changed = git diff --name-only $before $after
Write-Host "Ändrade filer:"
$changed | ForEach-Object { Write-Host "   $_" }

# ── 2. Starta om det som behöver det ─────────────────────────────────
Set-Location $server
if ($changed | Where-Object { $_ -like 'flodljus-api/*' }) {
  Say "2/3  Sparnings-API:et har ändrats. Bygger om det (tar en minut)..."
  docker compose up -d --build flodljus-api
  if ($LASTEXITCODE) { Fail "Ombyggnaden misslyckades. Kör: docker compose logs flodljus-api" }
} else {
  Say "2/3  Bara spelfiler har ändrats. Ingen omstart behövs."
}
if ($changed | Where-Object { $_ -like 'nginx/*' }) {
  docker compose restart nginx
}

# ── 3. Kontrollera ───────────────────────────────────────────────────
Say "3/3  Kontrollerar..."
try {
  $h = Invoke-RestMethod http://localhost:8080/api/health -TimeoutSec 10
  if ($h.ok) { Write-Host "   Molnsparningen svarar: OK" -ForegroundColor Green }
} catch {
  Write-Host "   Varning: /api/health svarar inte. Kör: docker compose logs flodljus-api" -ForegroundColor Yellow
}
$m = Select-String -Path (Join-Path $repo 'flodljus-spel\audio.js') -Pattern 'GAME_VERSION = (\d+)' | Select-Object -First 1
$v = if ($m) { $m.Matches[0].Groups[1].Value } else { '?' }

Say "Klart! Spelet är nu version $v. Ladda om sidan i webbläsaren."
