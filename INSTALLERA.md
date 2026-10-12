# Flodljus Manager – molnsparning på din egen server

Med det här följer en karriär med mellan dina enheter (iPhone, Mac mini, PC) via Tailscale.
Sparningarna lagras i din Postgres-databas.

```
 iPhone ─┐                       Kupp Server (Docker)
         │  Tailscale      ┌──────────────────────────────────────────┐
 Mac ────┼──────────────▶  │ nginx :8080                              │
         │                 │  ├─ /        → spelet (flodljus-spel/)   │
 PC ─────┘                 │  └─ /api/    → flodljus-api  ──▶  db     │
                           │                (Node + pg)    (Postgres) │
                           └──────────────────────────────────────────┘
```

**Spelarkoden** ersätter inloggning. Varje enhet får en kod, till exempel `BE6N-V3PV`. Skriv in
samma kod på en annan enhet så hämtas samma karriär.

---

## Det här finns i mappen

| Fil/mapp | Vad den gör |
|---|---|
| `flodljus-api/` | API-tjänsten: `GET`/`PUT`/`DELETE /api/save/<kod>` + `GET /api/health`. Skapar tabellen `saves` själv. Gräns: 5 MB per sparning. |
| `flodljus-spel/` | Spelet (version 26 eller senare) med spelarkod och serversparning. |
| `nginx/flodljus.conf` | Visar spelet och skickar `/api/` vidare till API:et, så att allt har samma adress. |
| `docker-compose.flodljus.yml` | Raderna som ska in i din `docker-compose.yml`. |
| `test-api.ps1` | Testar PUT/GET/DELETE och visar vad som ligger i databasen. |

---

## Steg 1 – Säkerhetskopiera

Kopiera `C:\Users\peter\Kupp Server\docker-compose.yml` till `docker-compose.yml.backup`.
Går något fel kan du alltid gå tillbaka.

## Steg 2 – Lägg filerna på servern

Kopiera in de här i `C:\Users\peter\Kupp Server\`:

```
Kupp Server\
├─ docker-compose.yml        (finns redan)
├─ flodljus-api\             ← ny
├─ flodljus-spel\            ← ny
├─ nginx\flodljus.conf       ← ny
└─ test-api.ps1              ← ny
```

## Steg 3 – Uppdatera docker-compose.yml

Öppna `docker-compose.yml` och `docker-compose.flodljus.yml` bredvid varandra.

1. **Lägg till hela blocket `flodljus-api:`** under `services:`.
2. **Kontrollera databasuppgifterna.** I din `db`-tjänst står det något i stil med
   `POSTGRES_USER`, `POSTGRES_PASSWORD` och `POSTGRES_DB`. `flodljus-api` ska använda **samma**
   värden. Står värdena i en `.env`-fil fungerar `${POSTGRES_USER}` och de andra direkt. Står de
   som vanlig text i `db`-tjänsten kan du flytta dem till `.env`, eller skriva samma text i
   `flodljus-api`.
3. **I din befintliga nginx-tjänst:** lägg till de två `volumes`-raderna och `depends_on`.
   ⚠️ Om nginx redan har en egen konfigurationsfil som du vill behålla, lägg bara till
   `location /api/ { … }`-blocket från `nginx/flodljus.conf` i den, i stället för att ersätta den.
4. Heter din databastjänst något annat än `db`: byt `PGHOST: db` och `depends_on: - db`.

## Steg 4 – Starta

Öppna PowerShell i `C:\Users\peter\Kupp Server` och kör:

```powershell
docker compose up -d --build
docker compose ps
docker compose logs flodljus-api
```

I loggen ska det stå **`Databasen är redo (tabellen saves finns).`** och
**`flodljus-api lyssnar på port 3000`**.

## Steg 5 – Testa API:et

```powershell
powershell -ExecutionPolicy Bypass -File .\test-api.ps1
```

Du ska se: `ok: True` → sparning → hämtning → borttagning → `404 – sparningen är borttagen` →
en tabell från databasen.

## Steg 6 – Testa spelet

1. Öppna **http://100.104.83.82:8080** i webbläsaren. Startskärmen ska visa
   **☁️ Sparas på din server** och en spelarkod.
2. Starta en karriär och spela en match.
3. Kontrollera att den finns i databasen:
   ```powershell
   docker compose exec -T db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB -c ''SELECT id, saved_at, length(data) FROM saves'''
   ```
   Din spelarkod (utan bindestreck) ska stå i kolumnen `id`.
4. Öppna ett **inkognitofönster**, gå till samma adress, skriv in koden under
   *"Har du en kod från en annan enhet?"* och tryck **Hämta karriär**. Din klubb ska dyka upp.

---

## Koppla din iPhone

1. Installera **Tailscale** från App Store och logga in med **samma konto** som servern.
   Slå på anslutningen (reglaget i appen).
2. Öppna **Safari** och gå till **http://100.104.83.82:8080**.
3. Tryck **Dela → Lägg till på hemskärmen**. Då får du en ikon som startar spelet som en app.
4. På startskärmen: skriv in koden från datorn under *"Har du en kod från en annan enhet?"*
   och tryck **Hämta karriär**.
5. Klart. Iphonen använder nu samma kod. Spela växelvis på telefonen och datorn.

Koden syns också i spelet under **Översikt → Klubben**.

---

## Bra att veta

- **Skydd mot överskrivning:** om spelet står öppet på en enhet medan du spelar vidare på en
  annan, vägrar servern att den gamla enheten skriver över det nyare. Du får då rutan
  *"Karriären har spelats på en annan enhet"*. Tryck **Ladda om** så fortsätter du där du slutade.
- **Utan server** (till exempel om Tailscale är avstängt) sparar spelet i telefonen som förut.
  Nästa gång servern nås sparas karriären dit igen.
- **Koden är nyckeln.** Den som har koden kan öppna karriären. Eftersom servern bara nås via
  ditt Tailscale-nät är det rimligt för privat bruk. Dela inte koden offentligt.
- **Karriären i Claude-versionen** flyttas inte automatiskt hit. Den sparas på en annan plats.
  Det går att bygga en export och import om du vill ta med den.

## Felsökning

| Det här händer | Gör så här |
|---|---|
| Ingen kodruta på startskärmen | API:et svarar inte. Kör `docker compose logs flodljus-api` och `docker compose logs nginx`. Öppna http://100.104.83.82:8080/api/health – där ska det stå `{"ok":true}`. |
| Loggen säger `Väntar på databasen …` hela tiden | Fel databasuppgifter eller fel värdnamn. Jämför `PGUSER`/`PGPASSWORD`/`PGDATABASE` med `db`-tjänsten. |
| `password authentication failed` | Lösenordet i `flodljus-api` matchar inte `db`. |
| `413` vid sparning | Sparningen är större än 5 MB. Höj `MAX_SAVE_MB` och `client_max_body_size` i nginx. |
| Iphonen når inte adressen | Kontrollera att Tailscale är **på** i telefonen och att servern syns i Tailscale-appen. |
