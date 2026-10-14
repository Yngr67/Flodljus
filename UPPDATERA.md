# Uppdatera Flodljus på servern direkt från GitHub

Servern hämtar själv den senaste versionen från GitHub. Du behöver inte kopiera filer för hand.

```
  Claude gör ändringar          Du godkänner                 Servern hämtar
 ┌──────────────────┐        ┌──────────────────┐        ┌────────────────────┐
 │ arbetsgren       │  ───▶  │ "Merge" på GitHub │  ───▶  │ uppdatera.ps1      │
 │ claude/...       │        │ → grenen main     │        │ git pull från main │
 └──────────────────┘        └──────────────────┘        └────────────────────┘
```

Servern hämtar bara från **main**. Det fungerar som en spärr: inget når servern förrän du har tryckt
**Merge** på GitHub.

---

## Engångsinstallation (cirka 15 minuter)

### Steg 1 – Installera Git

1. Öppna PowerShell och skriv `git --version`.
2. Svarar den `git version ...` är Git redan installerat. Gå till steg 2.
3. Annars: hämta **Git for Windows** från https://git-scm.com/download/win och installera med
   standardvalen (tryck **Next** hela vägen). Stäng PowerShell och öppna det igen.

### Steg 2 – Hämta repot till servern

```powershell
cd "C:\Users\peter\Kupp Server"
git clone https://github.com/Yngr67/Flodljus.git flodljus
```

Nu finns en ny mapp, `Kupp Server\flodljus\`, med allt från GitHub.

### Steg 3 – Peka om docker-compose.yml till den nya mappen

Spara först en säkerhetskopia av `docker-compose.yml`. Öppna sedan filen och ändra **två rader**:

| Var | Före | Efter |
|---|---|---|
| under `flodljus-api:` | `build: ./flodljus-api` | `build: ./flodljus/flodljus-api` |
| under `nginx:` → `volumes:` | `- ./flodljus-spel:/usr/share/nginx/html:ro` | `- ./flodljus/flodljus-spel:/usr/share/nginx/html:ro` |

Rör inget annat. Raden med `nginx/flodljus.conf` ska stå kvar som den är.

### Steg 4 – Starta om med de nya sökvägarna

```powershell
docker compose up -d --build flodljus-api nginx
```

Öppna http://100.104.83.82:8080. Spelet och din karriär ska se ut precis som förut.

### Steg 5 – Städa (först när steg 4 fungerar)

De gamla mapparna `Kupp Server\flodljus-spel\` och `Kupp Server\flodljus-api\` används inte längre.
Byt namn på dem till `gammal-flodljus-spel` och `gammal-flodljus-api`. Radera dem efter en vecka om
allt fungerar.

---

## Varje gång det finns en ny version

```powershell
cd "C:\Users\peter\Kupp Server"
powershell -ExecutionPolicy Bypass -File .\flodljus\uppdatera.ps1
```

Skriptet gör det här:

```
 1/3  Hämtar senaste versionen ........ git pull
 2/3  Startar om API:et ............... bara om API-filerna har ändrats
 3/3  Kontrollerar .................... molnsparningen svarar? vilken version?
      Klart! Spelet är nu version 30.
```

Om bara spelfilerna har ändrats behövs ingen omstart. Ladda om sidan så har du den nya versionen.

## Om något går fel

| Meddelande | Betyder | Gör så här |
|---|---|---|
| `git saknas` | Git är inte installerat | Gör steg 1 |
| `Någon fil ... har ändrats för hand` | Någon fil i `flodljus\` har redigerats på servern | Kör `cd flodljus` och sedan `git checkout .` för att ta bort ändringen. Kör skriptet igen. |
| `Kunde inte hämta` | Ingen kontakt med GitHub | Kontrollera internet. Den gamla versionen fungerar under tiden. |
| `/api/health svarar inte` | Sparnings-API:et startade inte | `docker compose logs flodljus-api` |
