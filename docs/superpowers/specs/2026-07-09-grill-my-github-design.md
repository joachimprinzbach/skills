# Design: `grill-my-github` — GitHub-Repo-Review in Joachims Stimme

Datum: 2026-07-09
Status: akzeptiert (brainstorming abgeschlossen)

## Zweck & Naht

Ein neuer Skill in der Collection, der **nicht den Code**, sondern **wie das Repo
als Engineering-Betrieb geführt wird** grillt — Governance, Delivery-Flow,
Wissens-Hygiene. Datenquelle: `gh` (GitHub CLI), **strikt read-only**.

Saubere Trennung zu den Geschwistern:

| Skill | Grillt | Datenquelle |
|---|---|---|
| `grill-me-joachim` | das Code-Artefakt (Design, Qualität, Craft) | Dateiinhalte |
| `grill-my-github` | den Repo-Betrieb (Governance, Flow, Hygiene) | `gh` API/CLI |
| `check-my-machine` | die lokale Maschine (Tool-Readiness) | lokale Shell |

Der letzte Commit an `grill-me-joachim` hielt dieses bewusst *strikt auf die
Codebase* begrenzt. `grill-my-github` füllt die komplementäre Hälfte.

## Blickwinkel

**Holistisch**: Governance **und** Ways-of-Working zusammen, in einem
priorisierten Verdikt. Dedizierte Security-Settings (Dependabot, Secret/Code
Scanning) sind **bewusst ausgeklammert** — ein Stück Security-Posture steckt
implizit im Branch-Schutz (Required Reviews, Push-Rechte) und wird dort als Teil
von Governance mitgenommen, ohne eine volle Security-Lens aufzumachen.

## Haltung

Erbt Joachims Stimme aus `grill-me-joachim` (direkt & ehrlich, pragmatisch,
handwerklich, lehrend nicht nur prüfend, Humor an / Weichzeichner aus,
prinzipientreu nicht dogmatisch) — plus zwei skill-spezifische Leitplanken:

- **Groundedness-via-gh (nicht verhandelbar).** Jedes Finding hängt an einer
  **konkreten `gh`-Ausgabe**: ein Setting-Wert, eine PR-/Issue-Nummer, eine
  Zahl, ein Datum. Kein Beleg → kein Finding. Das ist das Äquivalent zur
  `datei:zeile`+Zitat-Regel von `grill-me-joachim` und der Haupt-Killer gegen
  schwammige/halluzinierte Aussagen ("die Review-Kultur wirkt schwach" ist
  verboten, "PR #142 wurde 4 Minuten nach Öffnung ohne Kommentar gemerged" ist
  erlaubt).
- **Kein Menschen-/Org-Assessment.** Contributor-Verteilung ist ein
  *Repo-Signal* (Bus-Faktor), keine Personenbewertung. Explizit im Skill benannt.

## Read-only-Garantie

Nur lesende `gh`-Calls. Fixes werden als **copy-paste `gh`-Befehle** ausgegeben,
nie ausgeführt — wie `check-my-machine`. Das Urteil und der Klick bleiben beim
Menschen. Nach außen gerichtete Änderungen sind schwer reversibel.

## Pragmatismus-Regler (zentral)

Strenge skaliert mit dem Einsatz des Repos — sonst nagt der Skill ein
Solo-Prototyp-Repo mit "fehlende Required Reviews" voll:

- **Solo-/Wegwerf-/Personal-Repo** → leichte Hand. Branch Protection bei einem
  Ein-Personen-Repo ist Theater; nur echte Blocker plus ein, zwei Hinweise.
- **Team-Repo, normal** → normaler Grill.
- **Geteilte Plattform / viele Nutzer / öffentlich** → voller Grill; hier zahlt
  Governance-Sorgfalt am meisten, weil Fehlerkosten sich über alle Nutzer
  multiplizieren.

Ist die Einsatzreife unklar und ändert sie die Bewertung wesentlich: **eine**
präzise Frage. Sonst: Annahme treffen, offenlegen, weitermachen.

## Ablauf (leichte Struktur)

Bewusst **kein** voller Sub-Agent-Fan-out wie bei `grill-me-joachim` — die
gh-Daten sind gebunden und passen meist in einen Kontext.

1. **Scope & kalibrieren** — Repo erkennen (`gh repo view`), Einsatzreife
   einordnen (Regler), prüfen ob `gh` installiert & authentifiziert ist. Fehlt
   `gh` / keine Auth → freundlich auf `check-my-machine` verweisen und abbrechen.
2. **Gather** — read-only `gh`-Signale pro Lens einsammeln (konkrete Befehle in
   `references/gh-cookbook.md`).
3. **Urteilen** — inline über die 3 Lenses. **Nur bei echter Breite** (viele
   offene PRs/Issues) an Sub-Agenten fächern — dieselbe Regel wie bei grill:
   unterhalb echter Breite lohnt der Overhead nicht.
4. **Als Joachim synthetisieren** — deduplizieren, gegen den Regler final
   kalibrieren, ehrlich priorisieren (führe mit den 2–3 Dingen die zählen),
   benennen was *gut* ist, alles in *einer* Stimme.

## Die 3 Lenses

- **(a) Governance & Branch-Schutz** — Branch Protection Rules, Required
  Reviews/Status-Checks, CODEOWNERS, Default-Branch, Merge-Strategie
  (Merge/Squash/Rebase), Tag-/Release-Schutz, wer darf direkt auf `main` pushen.
- **(b) PR-Kultur / Delivery-Flow** — PR-Größe (geänderte Dateien/Zeilen),
  Review-Tiefe & -Latenz (Zeit bis erstes Review, Zahl der Reviewer/Kommentare),
  tote/langlebige Branches, offene Draft-Leichen, Merge-vs-Squash-Muster,
  CI-Grün-Rate.
- **(c) Issue- & Wissens-Hygiene** — Triage/Labels/Templates, Backlog-Alter,
  PR/Issue-Beschreibungsqualität, Release-Notes/Changelog, Contributor-
  Verteilung (Bus-Faktor als Signal, keine Menschen-Benotung).

## Schweregrade

Gleiche Skala wie `grill-me-joachim`, gegen den Regler kalibriert:

- **Blocker** — z. B. `main` ohne jeden Schutz auf einem geteilten Plattform-
  Repo, direkte Push-Rechte für alle auf einem produktiven Default-Branch.
  (Secrets im Repo o. ä. gehört zum Code-Grill, nicht hierher.)
- **Sollte behoben werden** — echte Betriebsschuld, die absehbar beißt (keine
  Required Reviews im Team-Repo, chronisch riesige PRs, tote Branches en masse).
- **Zur Überlegung** — Abwägungssache (Merge- vs. Squash-Strategie); Trade-off
  nennen, nicht für die Person entscheiden.
- **Nit** — Kleinkram (fehlendes Label-Schema); bei vielen Nits die eigentliche
  Empfehlung aussprechen (Templates/Automation einrichten).

## Ausgabeformat

Wie grill — HighLevel-Findings zuerst, dann Details:

```
## Verdikt
[1–2 ehrliche Sätze mit Persönlichkeit — wird das Repo sauber geführt für seinen Zweck?]

## Was gut ist
[2–3 konkrete Punkte — ehrlich, keine Pflichtübung]

## Blocker
## Sollte behoben werden
## Zur Überlegung
## Nits
```

Jeder Fund: **Was** (mit gh-Beleg — Setting-Wert / PR-#/Issue-#/Zahl/Datum) →
**Warum** (welches Prinzip, welche Lens) → **Fix** (konkreter copy-paste
`gh`-Befehl, den der Mensch selbst ausführt).

## Progressive Disclosure

Ein Referenz-File **`references/gh-cookbook.md`**:

- die exakten **read-only** `gh`/API-Befehle pro Lens (Gather-Rezepte),
- **Interpretations-Schwellen** ("PR > N geänderte Dateien = groß", "Branch seit
  > M Tagen ohne Commit = tot", "Zeit-bis-erstes-Review > T = zähe Review-Kultur").

Hält SKILL.md schlank und verhindert, dass das Modell gh-Syntax rät. Leicht
revidierbar zu einer einzelnen Datei, falls es zu dünn bleibt.

## Ton & Sprache

Deutsch (Hochdeutsch), gleicher Ton wie die Geschwister-Skills. Fachbegriffe
(branch protection, required reviews, PR size, coverage …) dürfen englisch
bleiben.

## Housekeeping

- README-Tabelle um `grill-my-github` ergänzen.
- CLI/Plugin entdecken den Skill automatisch über `skills/<name>/SKILL.md` —
  kein Code zu ändern.
- Release via Conventional Commit (`feat:`).

## Nicht-Ziele (YAGNI)

- Keine dedizierte Security-Settings-Lens (Dependabot/Scanning).
- Kein Schreiben/Mutieren via `gh` (keine Issues anlegen, keine Fix-PRs).
- Keine Team-/Personen-Bewertung.
- Kein GitHub-Enterprise-/Org-weiter Scan — Scope ist **ein** Repo.
