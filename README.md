# Ausgaben-Rechner

Eine schlichte Web-App, mit der eine kleine Gruppe von Personen gemeinsame Ausgaben erfasst und am Ende untereinander abrechnet („settle up“).

## Funktionen

- **Personen** manuell über die App verwalten (hinzufügen, umbenennen, entfernen).
- **Abrechnungen** anlegen (z. B. pro Monat oder pro Urlaub) – mehrere parallel möglich.
- **Ausgaben** erfassen: Beschreibung, Betrag, wer bezahlt hat, auf wen aufgeteilt (mit optionalen Anteilen/Gewichten) und in welcher Abrechnung.
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
client/   Vue-Frontend
server/   Express-API + SQLite
```

## Lokale Entwicklung

Voraussetzung: Node.js ≥ 20.

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173 (proxied `/api` → Backend)
- Backend/API: http://localhost:3000

## Produktion (Docker)

```bash
docker compose up -d --build
```

Die App ist dann unter http://localhost:3000 erreichbar. Die SQLite-Datei liegt im Docker-Volume `ausgaben-data` und bleibt über Neustarts erhalten.

## CI/CD (GitHub Actions)

Der Workflow `.github/workflows/docker-release.yml` baut das Docker-Image und lädt es in die GitHub Container Registry (GHCR) hoch:

- **Push auf `main`** → Image wird als `ghcr.io/<owner>/<repo>:latest` (und mit dem Commit-SHA) veröffentlicht.
- **Tag `v*`** (z. B. `v1.0.0`) → Image wird zusätzlich als `ghcr.io/<owner>/<repo>:v1.0.0` veröffentlicht und ein GitHub-Release mit Docker-Anleitung erstellt.

```bash
git tag v1.0.0
git push origin v1.0.0
```

Hinweis: GHCR-Pakete sind standardmäßig **privat**. Damit andere das Image ohne Login ziehen können, muss das Paket unter *Settings → Packages* (bzw. auf der Paketseite → *Package settings → Change visibility*) auf **Public** gestellt werden.

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

## Konfiguration (Umgebungsvariablen)

| Variable  | Standard  | Beschreibung                          |
| --------- | --------- | ------------------------------------- |
| `PORT`    | `3000`    | Port des Servers                      |
| `DATA_DIR`| `./data`  | Verzeichnis für die SQLite-Datei      |

## API

- `GET/POST /api/persons`, `PATCH/DELETE /api/persons/:id`
- `GET/POST /api/settles`, `PATCH/DELETE /api/settles/:id`
- `POST /api/settles/:id/close`, `POST /api/settles/:id/reopen`
- `GET/POST /api/expenses?settleId=…`, `PATCH/DELETE /api/expenses/:id`
- `PATCH /api/expenses/:id/settled` (`{ settled: boolean }`)
- `GET /api/settlement/:settleId`
- `GET /api/health`
