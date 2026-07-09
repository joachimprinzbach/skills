# Design: `grill-this` — der Orchestrator-Grill (ein Review über Code + Betrieb)

**Datum:** 2026-07-09
**Status:** Design, zur Review
**Repo:** `skills` (Plugin `jp-skills`)

## Problem

Das Grill-Ökosystem trennt Zuständigkeiten sauber und bewusst:

- `grill-me-joachim` → das **Code-Artefakt** (tief, geerdet via `datei:zeile`)
- `grill-my-github` → der **Repo-Betrieb** (Governance, PR-Kultur, Wissens-Hygiene, geerdet via `gh`)
- `check-my-machine` → die lokale Maschine

Diese Trennung ist richtig — jeder Skill bleibt scharf. Aber der **Empfänger eines Reviews will *ein* Review von Joachim**, keinen Stapel aus zwei bis drei separaten Skill-Outputs. Heute muss man die Skills einzeln aufrufen und die Ergebnisse selbst zusammenführen.

Zusätzlich fehlt ein Genre, das keiner der Grills abdeckt: der **System-Überblick** (Landkarte, Datenfluss, Tech-Stack) — Orientierung statt Prüfung. Und es fehlt ein **Breiten-Modus**: nicht jeder Review braucht durchgängige Tiefe; manchmal reicht ein breiter, flacher Blick mit gezielter Tiefe an den Hebelstellen.

Referenz-Beispiel für das gewünschte Deliverable: die beiden HTML-Seiten `orpheus-overview.html` und `orpheus-quality-roadmap.html` im Orpheus-Workspace (dark + gold, Scorecard, priorisierte Tiers). Deren Schwachpunkt — weiche, unbelegte Claims — wird hier bewusst vermieden.

## Entscheidung

Ein neues Skill **`grill-this`**: ein **Orchestrator ohne eigene Review-Logik**, der die scharfen Einzel-Skills als Finder dirigiert und daraus **ein** Joachim-Review in **einer Stimme** synthetisiert — standardmäßig als **teilbare HTML-Seite**.

Verworfene Alternativen:
- **Alles zurück in `grill-me-joachim` mergen** — macht genau die Verwässerung rückgängig, die der Split (`fix: keep grill-me-joachim strictly a codebase review`) behoben hat.
- **Nur eine Synthese-Konvention dokumentieren** — automatisiert das „ein Review" nicht; zu dünn für den wiederkehrenden Plattform-Bedarf (Orpheus = 17 Repos).

## Leitprinzip (schützt die Schärfe der Sub-Skills)

`grill-this` enthält **keine** Review-Kriterien. Keine Code-Smells, keine gh-Rezepte, keine Referenzdateien mit Prüf-Inhalten. Es konsumiert die Sub-Skills **auf ihrer Finder-Ebene** (deren Linsen + Referenzdateien + Groundedness-Regeln) und **ersetzt deren Einzel-Synthese durch eine domänenübergreifende Synthese**. Wächst `grill-this` Prüf-Logik an, ist das ein Design-Fehler — sie gehört in den zuständigen Sub-Skill.

Konsequenz: `grill-me-joachim` und `grill-my-github` bleiben **unverändert** und einzeln aufrufbar.

## Ablauf

Vier Schritte, plus Rendering: **Scope & kalibrieren → orientieren → über Sub-Skills gathern → als Joachim synthetisieren → HTML rendern.**

### 1. Scope klären & kalibrieren

- **Scope erkennen:** ein Repo, oder ein Workspace mit vielen Repos (wie der Orpheus-Root mit 17 Unterordnern)? Bei Mehrdeutigkeit eine präzise Frage, sonst Annahme offenlegen.
- **Zwei Regler setzen:**
  - **Pragmatismus** (aus den Sub-Skills geerbt): Spike/Prototyp → leichte Hand; interne App → normal; geteilte Plattform / öffentliche API → voller Grill.
  - **Breite ↔ Tiefe** (neu, orchestrator-eigen): „breit" = Overview + Tiefe nur an den Hebelstellen; „voller Grill" = `datei:zeile` durchgängig. Steuert, wie tief der Code-Grill fächert. Default bei großer Plattform: **breit-zuerst mit gezielter Tiefe**, nicht erschöpfendes `datei:zeile` überall.

### 2. Orientieren (die Breite)

Ein Overview-Pass baut die **System-Landkarte**: Repos & Rollen, Datenfluss, Tech-Stack, offensichtliche Auffälligkeiten. Wird **doppelt genutzt**:
- als **Intro des Reviews** (das Overview-Genre, in das eine Review integriert),
- als **mentales Modell**, das die tiefen Pässe fokussiert.

Bei einem einzelnen kleinen Repo ist dieser Pass leicht (ein Absatz); bei einer Plattform trägt er ein Datenfluss-Diagramm.

### 3. Gathern über die Sub-Skills (Finder-Ebene)

- **Code-Domäne:** der Linsen-Fan-out von `grill-me-joachim` (Design/Architektur, Code-Qualität, Handwerk, Frontend, Wartbarkeit) — kalibriert am Breiten-Regler. Sub-Agenten lesen die jeweilige Referenzdatei aus `grill-me-joachim/references/` und folgen deren Methodik + Groundedness-Regel (`datei:zeile` + Zitat).
- **Betriebs-Domäne:** das Gathern von `grill-my-github` (Governance & Branch-Schutz, PR-Kultur & Delivery-Flow, Issue-/Wissens-Hygiene) nach `grill-my-github/references/gh-cookbook.md`.
- **Bei Plattform-Scope:** beide Domänen laufen über die Repos; Ergebnisse aggregieren.

Der Orchestrator unterdrückt die **Einzel-Synthese** der Sub-Skills — er nutzt nur ihre Finder.

### 4. Synthese als Joachim — eine Stimme

- **Dedup über die Domänen:** derselbe Sachverhalt aus zwei Quellen = ein Fund mit zwei Blickwinkeln (z. B. „keine ADRs" aus Code-Wartbarkeit *und* GitHub-Wissenshygiene).
- **Final kalibrieren** gegen die Regler.
- **Ehrlich priorisieren über beide Domänen** in **eine** Rangfolge: Blocker → Sollte → Überlegung → Nit.
- **Was gut ist** ehrlich und konkret benennen.
- Bei Plattform-Scope: Plattform-weite Themen **und** Repo-spezifische Fundstellen unterscheiden.

### 5. HTML rendern

Teilbare Seite im Stil der bestehenden Orpheus-Seiten (dark, Gold-Akzent `#d4a017`, self-contained, inline CSS). Aufbau:

- Header + **Verdikt**
- **Overview / Landkarte** (Intro; bei Plattform mit Datenfluss-Diagramm)
- **Scorecard** — Kern-Signale auf einen Blick
- **Priorisierte Tiers** Blocker → Nit, jeder Fund mit Beleg
- **Was gut ist**
- Footer (Stand, Scope, Erzeugungshinweis)

Default: als lokale `.html`-Datei im Arbeitsverzeichnis (passt zum bestehenden Muster der Orpheus-Seiten). Optional per Artifact publizierbar, wenn der Nutzer teilen will.

## Harte Leitplanke: keine unbelegten Aussagen im HTML

Der Schwachpunkt der bestehenden Roadmap-HTML (weiche Claims wie „besser als gedacht", „~250+ Testklassen" ohne Fundstelle) wird strukturell verboten: **Jede Scorecard-Kachel und jeder Tier-Eintrag trägt seinen Beleg** — `datei:zeile` (Code) oder gh-/git-Ausgabe (Betrieb). Ohne Beleg fliegt der Eintrag raus. Die Groundedness-Regel der Sub-Skills gilt bis ins gerenderte HTML.

## gh-Fallback (Entscheidung: b)

`grill-my-github` braucht `gh` + Authentifizierung. Fehlt beides (z. B. lokale Klone ohne gh-Zugang, wie im Orpheus-Workspace), **degradiert die Betriebs-Domäne auf lokal-ableitbare git-Signale**, statt sie zu überspringen:

- **Ableitbar aus lokalem git/Dateisystem:** Branch-Anzahl & -Alter (`git for-each-ref --sort=committerdate`), stale-Anteil (>90 Tage), Commit-Kadenz, Autor-Konzentration/Bus-Faktor (`git shortlog -sne` — mit `.mailmap`-Caveat bei Identitäts-Aliasing), Vorhandensein von `.github/workflows/`, `CODEOWNERS`, PR-Templates, `dependabot.yml`/`renovate.json`, READMEs/ADRs.
- **Nicht ohne gh prüfbar** (transparent als solches markieren, **nicht** erfinden): tatsächliche Branch-Protection-Settings, Required Reviews/Checks, PR-Review-Latenz & -Tiefe, Merge-Strategie-Historie.

Das Deliverable sagt offen, welche Betriebs-Signale aus lokalem git stammen und welche mangels gh nicht geprüft werden konnten (wie die bestehende Roadmap-HTML: „Branch-Daten aus lokalen Klonen").

## Dateistruktur des Skills

```
skills/grill-this/
  SKILL.md                       # Orchestrator-Ablauf, Regler, Delegations-Mechanik, Synthese
  references/
    report-template.md           # HTML-Skelett (dark/gold) + "keine unbelegten Aussagen"-Regel
```

Keine Prüf-Referenzdateien — die leben in den Sub-Skills. `report-template.md` ist reine Darstellung.

## Beziehung zu den Geschwister-Skills

- `grill-this` **dirigiert** `grill-me-joachim` + `grill-my-github`; es dupliziert deren Inhalt nicht.
- Für ein einzelnes Code-Review ohne Betrieb bleibt `grill-me-joachim` der direkte Weg; für reinen Repo-Betrieb `grill-my-github`. `grill-this` ist die Wahl, wenn **ein** ganzheitliches Review über beides gewünscht ist — besonders bei Plattformen mit mehreren Repos.

## Non-Goals (YAGNI)

- Kein eigenes Overview-Skill (die Breite lebt als Intro im Review).
- Keine Änderungen an `grill-me-joachim` / `grill-my-github`.
- Keine schreibenden Aktionen (read-only wie die Sub-Skills; Fixes als Vorschläge/Befehle).
- Kein Theme-Toggle im HTML (die bestehenden Seiten sind dark-only; wir matchen sie).
- Kein Cross-Repo-Dependency-Graph o. Ä. — erst wenn ein echter Bedarf auftaucht.

## Erfolgskriterium

Ein Aufruf von `grill-this` auf dem Orpheus-Workspace liefert **eine** HTML-Seite mit einem Verdikt, einer Landkarte als Intro, einer belegten Scorecard und einer über Code + Betrieb vereinten, priorisierten Fund-Rangfolge — ohne eine einzige unbelegte Aussage, und ohne dass `grill-me-joachim` oder `grill-my-github` dafür angefasst werden mussten.
