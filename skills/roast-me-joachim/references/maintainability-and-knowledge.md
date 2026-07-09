# Linse (e): Wartbarkeit & Wissensrisiko — im Artefakt sichtbar

*Wann lesen:* bei größeren Repos/PRs, wenn der Review fragt, ob die Codebase *auf Dauer* wartbar und übergabefähig ist — Wissenskonzentration, festgehaltenes Wissen, Onboarding. Bei einem 30-Zeilen-Solo-Diff überspringen.

**Vorab (Joachims Rahmung):** Dies ist ein **Codebase-Review**, kein Org-Assessment. Diese Linse bewertet **nur, was im Artefakt sichtbar ist** — git-History, Tests, Doku, PR — und bleibt damit **geerdet wie jede andere Linse** (Fundstelle + Zitat, sonst kein Finding). Sie empfiehlt **keine** Team-/Org-Änderungen (Teamschnitte, Rollen, Prozesse) — das steht einem Code-Review nicht zu. Sie zeigt, wo die *Codebase selbst* ein Wartungs- oder Wissensrisiko trägt, und schlägt Abhilfen im Code/Repo vor (Tests, ADRs, README).

## Prinzipien

### Bus-Faktor & Wissenssilos

Hängt ein kritischer Bereich nur an *einem* Autor über die ganze History, ohne Tests und ohne Doku, ist das ein Wissensrisiko (**Bus-Faktor 1**) — fällt die Person aus, kann niemand den Code sicher ändern (`philosophy-of-software-design.md`: Unknown Unknowns). Sichtbar in `git log`/blame plus fehlendem Test-/Doku-Bestand. *Abhilfe im Artefakt:* Charakterisierungs-Tests als Sicherheitsnetz (`engineering-craft.md` §2), das Kern-Wissen als README/ADR festhalten (`engineering-craft.md` §3).

### Festgehaltenes Wissen: ADRs & Absichts-Kommentare

Eine folgenreiche Entscheidung ohne **ADR**, ein nicht-offensichtlicher Mechanismus ohne **Absichts-Kommentar** — beides zwingt spätere Maintainer, das *Warum* neu zu rekonstruieren. Prüf, ob das geteilte Gedächtnis im Repo liegt (ADRs: `engineering-craft.md` §3; Kommentare: `philosophy-of-software-design.md`, `clean-code.md`).

### Lehrende PR

Eine PR-Beschreibung mit Kontext/Warum/Risiko macht den Diff review- und wartbar; eine leere Beschreibung auf einer nicht-trivialen Änderung zwingt zum Raten (Mechanik: `engineering-craft.md` §5).

### Onboarding & Navigierbarkeit

Kommt ein Neuer in Minuten zum Laufen (README, Quickstart) und findet sich zurecht (konsistente Struktur, sprechende Namen, ein durchgezogenes Muster)? Onboarding-Reibung verteuert jeden künftigen Beitrag — und ist dieselbe Eigenschaft, die eine Codebase AI-navigierbar macht (`engineering-craft.md` §6).

## Worked Examples

**Beispiel 1 — Bus-Faktor 1, im Artefakt sichtbar („Sollte behoben werden")**

```
# git log --format='%an' -- src/pricing/RiskEngine.java | sort -u
Jane Doe        # einziger Autor über 3 Jahre; kein Test, kein README, keine ADR
```
→ *Warum:* Ein geschäftskritisches Modul hängt an einer Person — bei Ausfall blockiert, und niemand kann es sicher ändern (`philosophy-of-software-design.md`: Unknown Unknowns).
→ *Vorschlag:* Charakterisierungs-Tests (`engineering-craft.md` §2), Kern-Entscheidungen als ADR/README festhalten, damit das Wissen im Repo liegt statt in einem Kopf.

**Beispiel 2 — Nicht-lehrende PR (geerdet an der PR)**

```
Title: fix
Description: (leer)     # 480 Zeilen über 14 Dateien
```
→ *Warum:* Der Reviewer muss die Absicht rekonstruieren; das Review wird oberflächlich (`engineering-craft.md` §5). Der große, ungebündelte Diff ist zusätzlich schwer prüfbar.
→ *Vorschlag:* PR aufteilen, je Teil Kontext/Motivation/Risiko ergänzen.

## Review-Fragen (Checkliste)

- Hängt ein kritischer Bereich an einer einzigen Person (git-blame), ohne Tests/Doku?
- Sind folgenreiche Entscheidungen als ADR festgehalten, nicht-offensichtliche Stellen mit Absichts-Kommentar?
- Trägt die PR-Beschreibung Kontext/Warum/Risiko, oder muss der Reviewer raten?
- Kommt ein Neuer in Minuten zum Laufen und findet sich zurecht?
