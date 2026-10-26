# Ausgaben-Rechner

Eine schlichte Web-App, mit der eine kleine Gruppe von Personen gemeinsame Ausgaben erfasst und am Ende untereinander abrechnet („settle up“).

## Funktionen

- **Personen** manuell über die App verwalten (hinzufügen, umbenennen, entfernen).
- **Abrechnungen** anlegen (z. B. pro Monat oder pro Urlaub) – mehrere parallel möglich.
- **Ausgaben** erfassen: Beschreibung, Betrag, Monat, wer bezahlt hat, auf wen aufgeteilt (mit optionalen Anteilen/Gewichten) und in welcher Abrechnung.
- **Abrechnung abschließen**: Eine abgeschlossene Abrechnung wird eingefroren (schreibgeschützt) und kann jederzeit wieder geöffnet werden.
- **Ausgaben als „bezahlt“ markieren**: Einzelne Ausgaben können als beglichen markiert werden; sie fließen dann nicht mehr in die Ausgleichsberechnung ein, sondern werden separat ausgewiesen.
- **Ausgleich**: automatische Berechnung der Kontostände und der minimalen Ausgleichszahlungen („wer überweist wem wie viel“) je Abrechnung.

## Technik

- **Frontend**: Vue 3 + TypeScript + Vite (vollständig responsive, mobile-first).
- **Backend**: Node.js + Express + TypeScript.
- **Speicher**: SQLite (einzelne Datei, keine separate Datenbank nötig).
- **Deployment**: Docker / Docker Compose.

## Projektstruktur

```
client/   Vue-Frontend (app/, modules/, shared/)
server/   Express-API + SQLite (app/, modules/, shared/)
e2e/      Playwright-UI-Tests
docs/     Architektur-Dokumentation
```

Die Anwendungen sind als Modularer Monolith aufgebaut: Jedes fachliche Modul
(`persons`, `settles`, `expenses`, `settlement`) besitzt eine öffentliche
Schnittstelle (`index.ts`); interne Dateien sind für andere Module tabu. Die
Details und Regeln stehen in `docs/architecture/README.md`.

## Lokale Entwicklung

Voraussetzung: Node.js ≥ 20.

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173 (proxied `/api` → Backend)
- Backend/API: http://localhost:3005

Ist der Standardport belegt, kann ein anderer Port gesetzt werden. `PORT`
steuert sowohl den API-Server als auch das Ziel des Vite-Dev-Proxys:

```bash
PORT=3006 npm run dev
```

Dann läuft die API auf http://localhost:3006, das Frontend bleibt auf
http://localhost:5173.

## Prüfungen

Die gleichen Prüfungen laufen in der CI (`.github/workflows/ci.yml`):

```bash
npm run typecheck         # Vue- und Server-TypeScript
npm run lint              # ESLint für Vue und TypeScript
npm run format:check      # Prettier
npm run contracts:check   # OpenAPI-Typen auf Aktualität prüfen
npm run arch:check        # Modulgrenzen und Abhängigkeitsrichtung
npm test                  # Unit-, Integrations- und Contract-Tests
npm run build             # Produktions-Build beider Workspaces
npm run verify            # alles in CI-Reihenfolge
```

Der REST-Vertrag liegt in `contracts/openapi.yaml`; Details zur Generierung
und zu den Contract-Tests stehen in `contracts/README.md`.

### UI-Tests (Playwright)

Die UI-Tests bauen das Produktions-Image aus dem vorhandenen `Dockerfile` und
starten es mit [Testcontainers](https://node.testcontainers.org/) auf einem
freien Port. Jeder Testlauf bekommt eine frische, flüchtige SQLite-Datenbank im
Container; es wird kein Volume verwendet.

Voraussetzungen:

- Ein erreichbarer Docker-Daemon.
- Chromium für Playwright: `npx playwright install chromium`.

```bash
npm run e2e          # Image bauen, Container starten, Tests ausführen
npm run e2e:ui       # interaktiver Playwright-Modus
```

Für einen bereits laufenden Server (z. B. `npm start`) können die Tests ohne
Container laufen:

```bash
E2E_BASE_URL=http://localhost:3005 npm run e2e
```

Dabei werden Testdaten in der laufenden Instanz angelegt. Für diesen Modus
daher besser eine separate Instanz mit eigener `DATA_DIR` verwenden.

Die Tests decken Personen, Abrechnungen, Ausgaben, Ausgleich und den
Kontoauszug-Import ab. Fehlerberichte und Traces liegen nach einem Lauf unter
`playwright-report/` bzw. `test-results/`. In der CI läuft zusätzlich ein
separater `e2e`-Job.

Die Tests sind thematisch unter `e2e/specs/` gruppiert. Seitenaktionen liegen in
`e2e/pages/` (PageObjects), untergeordnete Elemente wie Dialoge, Zeilen und
Karten in `e2e/controls/` (ControlObjects). Die Specs arbeiten ausschließlich
mit diesen Objekten.

## Produktion (Docker)

```bash
docker compose up -d --build
```

Die App ist dann unter http://localhost:3000 erreichbar. Die SQLite-Datei liegt im Docker-Volume `ausgaben-data` und bleibt über Neustarts erhalten.

## CI/CD (GitHub Actions)

Der Workflow `.github/workflows/docker-release.yml` baut das Docker-Image bei jedem Push:

- **Push auf `main`** → Image wird nur **gebaut** (Build-Check), nicht veröffentlicht.
- **Tag `v*`** (z. B. `v1.0.0`) → Image wird als `ghcr.io/<owner>/<repo>:v1.0.0` und `:latest` in die GitHub Container Registry (GHCR) hochgeladen und ein GitHub-Release mit Docker-Anleitung erstellt.

Die Release-Notes werden dabei mit [git-cliff](https://git-cliff.org/) aus den
Conventional Commits seit dem vorherigen `v*`-Tag erzeugt. Die Gruppierung und
das Format stehen in `cliff.toml`.

```bash
git tag v1.0.0
git push origin v1.0.0
```

Hinweis: GHCR-Pakete sind standardmäßig **privat**. Damit andere das Image ohne Login ziehen können, muss das Paket unter _Settings → Packages_ (bzw. auf der Paketseite → _Package settings → Change visibility_) auf **Public** gestellt werden.

Image ziehen und starten:

```bash
docker pull ghcr.io/<owner>/<repo>:latest

docker run -d \
  --name ausgaben-rechner \
  --restart unless-stopped \
  -p 3000:3000 \
  -v ausgaben-data:/app/data \
  ghcr.io/<owner>/<repo>:latest
```

## Mitwirken

- **Aufgaben** werden mit [beads](https://github.com/gastownhall/beads) verfolgt
  (`bd ready`, `bd create`, `bd close`).
- **Commit-Messages** folgen [Conventional Commits](https://www.conventionalcommits.org/)
  und enden mit der Issue-ID, z. B. `feat: Wochenansicht als Baum (ausgaben-a3f2dd)`.
  Ein `commit-msg`-Hook erzwingt das; einmal pro Klon aktivieren:

  ```sh
  git config core.hooksPath .beads/hooks   # mit bd installiert (führt auch dessen Hooks aus)
  git config core.hooksPath .githooks      # ohne bd
  ```

- Anweisungen für KI-Agenten (Claude Code und opencode) liegen in
  `.claude/CLAUDE.md` (über den Symlink `AGENTS.md` erreichbar).

## Konfiguration (Umgebungsvariablen)

| Variable   | Standard | Beschreibung                                                      |
| ---------- | -------- | ----------------------------------------------------------------- |
| `PORT`     | `3005`   | Port des Servers und Ziel des Vite-Dev-Proxys (Docker setzt 3000) |
| `DATA_DIR` | `./data` | Verzeichnis für die SQLite-Datei                                  |

## API

- `GET/POST /api/persons`, `PATCH/DELETE /api/persons/:id`
- `GET/POST /api/settles`, `PATCH/DELETE /api/settles/:id`
- `POST /api/settles/:id/close`, `POST /api/settles/:id/reopen`
- `GET/POST /api/expenses?settleId=…`, `PATCH/DELETE /api/expenses/:id`
- `POST /api/expenses/import` (ausgewählte Kontoauszug-Zeilen)
- `PATCH /api/expenses/:id/settled` (`{ settled: boolean }`)
- `GET /api/settlement/:settleId`
- `GET /api/health`
