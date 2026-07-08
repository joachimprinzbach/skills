---
name: check-my-machine
disable-model-invocation: true
description: Prüft, ob die Maschine bereit für agentic coding ist — git, gh, node/npm, Claude CLI und Python/uv installiert, aktuell (gegen latest) und sinnvoll konfiguriert. Nur diagnostizieren, Fixes vorschlagen.
---

# Check my machine

Du prüfst, ob diese Kiste bereit für agentic coding ist: sind die Kern-Werkzeuge installiert, aktuell genug und sinnvoll konfiguriert. Du **diagnostizierst und schlägst Fixes vor** — du führst **keine** Reparatur selbst aus. Das Urteil trifft der Mensch.

Ausgabe auf **Deutsch (Hochdeutsch)**; Werkzeug- und Fachbegriffe bleiben englisch.

## Ablauf

Vier Schritte: **OS erkennen → jedes Tool prüfen → latest holen & bewerten → als Tabelle + Fix-Block ausgeben.**

### 1. OS erkennen

Bestimme die Plattform, denn Presence-Check und Fix-Befehle unterscheiden sich:

- **Windows / PowerShell** — Presence: `Get-Command <tool> -ErrorAction SilentlyContinue`. Latest online holen: `Invoke-RestMethod <url>`.
- **macOS / Linux** — Presence: `command -v <tool>`. Latest online holen: `curl -s <url>` (auf Windows 11 ist `curl` ebenfalls vorhanden und geht auch).

`core.autocrlf` wird **nur auf Windows** bewertet.

### 2. Jedes Tool prüfen

Für jedes Tool: installiert? welche Version? Fehlt es, ist die installierte Version leer — den Rest der Zeile überspringen.

| Tool | installierte Version | Anmerkung |
|---|---|---|
| **git** | `git --version` | fehlt → Blocker |
| **git config** | `git config --get user.name`, `git config --get user.email`, (Windows) `git config --get core.autocrlf` | siehe Bewertung |
| **gh** | `gh --version` (erste Zeile) | fehlt → Blocker |
| **gh auth** | `gh auth status` (Exit 0 = eingeloggt) | nicht eingeloggt → Blocker |
| **node** | `node --version` | fehlt → Blocker; gegen aktuelles **LTS** messen |
| **npm** | `npm --version` | fehlt → Blocker |
| **Claude CLI** | `claude --version` | fehlt → Blocker |
| **Python** | `python --version` bzw. `python3 --version` | fehlt → Hinweis (nur für Python-Projekte relevant) |
| **uv** | `uv --version` | fehlt → Hinweis (nur für Python-Projekte relevant) |

### 3. Latest holen & bewerten

Hol pro Tool die aktuelle Version online. Geht ein Aufruf ins Leere (kein Netz, Rate-Limit), trag `latest` als „n/a" ein und bewerte nur Vorhandensein/Konfiguration — **niemals abbrechen**.

| Tool | latest-Quelle |
|---|---|
| **git** | Windows: `https://api.github.com/repos/git-for-windows/git/releases/latest` (Feld `tag_name`); sonst neuester Nicht-`rc`-Tag aus `https://api.github.com/repos/git/git/tags` |
| **gh** | `https://api.github.com/repos/cli/cli/releases/latest` (`tag_name`) |
| **node** | `https://nodejs.org/dist/index.json` — erster Eintrag mit `lts != false` ist das empfohlene LTS |
| **npm** | `npm view npm version` |
| **Claude CLI** | `npm view @anthropic-ai/claude-code version` |
| **Python** | `https://endoflife.date/api/python.json` — `latest` des ersten noch unterstützten Cycles |
| **uv** | `https://api.github.com/repos/astral-sh/uv/releases/latest` (`tag_name`) |

**Bewertung je Zeile** (semver: MAJOR.MINOR.PATCH):

- **✗ Blocker** — Tool fehlt (außer Python/uv), *oder* installiert ist ≥ 1 Major hinter latest, *oder* `user.name`/`user.email` nicht gesetzt, *oder* `gh` nicht eingeloggt.
- **⚠ Hinweis** — Minor hinter latest, *oder* (Windows) `core.autocrlf` ist nicht `true`/`input`, *oder* Python/uv fehlt.
- **✓ OK** — installiert und höchstens einen Patch hinter latest (oder `latest` = n/a und vorhanden).

### 4. Ausgeben — Tabelle + Fix-Block

Erst die Status-Tabelle über **alle** geprüften Tools, dann ein Fix-Block **nur für die Zeilen, die nicht ✓ sind**. Ist alles ✓, sag das in einem Satz und lass den Fix-Block weg.

```
## Maschine: <✓ bereit | ⚠ mit Hinweisen | ✗ nicht bereit>

| Tool        | installiert | Version   | latest    | Status |
|-------------|-------------|-----------|-----------|--------|
| git         | ✓           | 2.44.0    | 2.47.1    | ⚠      |
| user.name   | ✓           | —         | —         | ✓      |
| ...         |             |           |           |        |

## Zu beheben

**git (⚠ Minor hinter latest)**
<copy-paste-Fix-Befehl für dieses OS>
```

Jeder Fix ist ein **copy-paste-fertiger Befehl für das erkannte OS** (z. B. `winget install --id Git.Git` / `brew install git`; `git config --global user.name "…"`; `gh auth login`; auf Windows `git config --global core.autocrlf true`). Kennst du den kanonischen Installationsweg des OS nicht sicher, gib den offiziellen Bezugslink statt eines geratenen Befehls.

**Completion criterion:** Jedes in Schritt 2 geprüfte Tool erscheint mit einem Status in der Tabelle, und jede Nicht-✓-Zeile hat genau einen Fix-Eintrag. Keine Zeile ohne Status, kein Problem ohne Fix.
