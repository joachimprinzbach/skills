# Linse (e): Ways of Working — Engineering Culture & Zusammenarbeit

*Wann lesen:* wenn der Review über den einzelnen Diff hinaus auf das *Wie der Zusammenarbeit* blickt — Wissensverteilung, Review-Kultur, geteiltes Gedächtnis, Onboarding. Am wertvollsten bei größeren Repos oder PRs mit mehreren Beteiligten; bei einem 30-Zeilen-Solo-Diff meist überflüssig (Lens-Selection: SKILL.md).

**Vorab (Joachims Rahmung):** Dies ist die einzige Linse, deren Befunde **über den Code hinausgehen** dürfen und **ohne `datei:zeile` auskommen** — Kultur lässt sich nicht immer zitieren. Deshalb gilt eine strikte Trennung: rein kulturelle Empfehlungen werden als **eigene, klar gekennzeichnete Kategorie „Zusammenarbeit & Kultur"** ausgegeben, **niemals** vermischt mit den geerdeten technischen Findings der anderen Linsen — sonst verwässert der technische Review. **Wo ein Kultur-Problem im Artefakt sichtbar ist** (ein Silo im git-blame, ein untestbarer Wissensklumpen, eine nicht-lehrende PR-Beschreibung), wird es **wie jeder technische Fund geerdet** (Fundstelle + Zitat) und läuft in den normalen Severity-Buckets. Nur das nicht-Zitierbare landet in der Kultur-Kategorie. Kalibriere am Pragmatismus-Regler: ein Solo-Wegwerf-Spike hat keine Kultur-Findings.

## Prinzipien

### Bus-Faktor & Wissenssilos

Wenn nur *eine* Person Modul X versteht, ist ihre Abwesenheit (Urlaub, Krankheit, Kündigung) ein Projektrisiko — der **Bus-Faktor**. Sichtbares Symptom: ein Bereich mit nur *einem* Autor über die ganze History, ohne README/ADR, mit implizitem Wissen im Kopf. *Gegenmittel:* Pairing/Mobbing gezielt auf Silo- und Risiko-Bereiche, das Wissen als Doku/ADR verankern (`engineering-craft.md` §3), Collective Code Ownership statt „das ist meins, Finger weg".

### Review als Lern- und Unterstützungsakt, nicht als Gate

Ein Review ist geteiltes Lernen und gemeinsame Verantwortung — nicht Machtausübung. **Blameless und an der Sache:** Feedback gilt dem Code, nie der Person. Konkret, begründet, mit Schweregrad (was ist Blocker, was Geschmack), damit der Autor nicht raten muss. Beide Seiten ohne Ego: Vorschläge annehmen *oder* sachlich begründen, warum nicht. *Anti-Pattern:* Rubber-Stamping („LGTM" ohne echtes Lesen) täuscht Sicherheit vor und ist schädlicher als kein Review. (Mechanik kleiner, reviewbarer PRs: `engineering-craft.md` §5.)

Das gemeinsame Fundament aller Prinzipien hier ist **Psychological Safety** — die geteilte Überzeugung, ohne Blossstellung ein Risiko eingehen zu können. Ohne sie werden Probleme spät sichtbar, Commitments unehrlich und Retros folgenlos. Sie wird nicht verordnet, sondern in jeder Interaktion auf- oder abgebaut.

### Geteiltes Gedächtnis: lehrende PRs, ADRs, Absichts-Kommentare

Der Autor liefert **Kontext im PR** — was, warum, was ist riskant, worauf soll der Reviewer schauen: die PR *lehrt* den Leser, statt nur zu funktionieren. Folgenreiche Entscheidungen als **ADR** (`engineering-craft.md` §3), damit sie in sechs Monaten nicht neu ausdiskutiert werden. **Kommentare, die Absicht/Invarianten teilen** (`philosophy-of-software-design.md`, `clean-code.md`) — dasselbe „Warum vor Was" auf Code-Ebene.

### Onboarding-Freundlichkeit

Kommt ein neuer Mensch in *Minuten* zum Laufen (README, Quickstart) und findet sich zurecht (konsistente Struktur/Namen, ein durchgezogenes Muster)? Onboarding-Reibung ist Kultur-Schuld, die jeden künftigen Beitrag verteuert.

### Gegenseitige Unterstützung & Know-how-Teilen

Blocker *früh* teilen statt tagelang allein festhängen; Hilfe anbieten statt Held sein. Wissen aktiv streuen: **Pairing/Mobbing** für Silo-Bereiche, **Guild/Chapter/Community of Practice** für Quer-Themen, eine **gemeinsame Definition of Done und Coding Guidelines**, auf die sich das Team verlässt — statt „frag mal den, der das geschrieben hat".

### Product Teams & End-to-End-Verantwortung

Ein Team besitzt seinen Dienst über den ganzen Lebenszyklus — bauen, betreiben, on-call („you build it, you run it"). Keine Übergabe an ein separates Ops-Team, die Feedback und Verantwortung zerreißt; wer den Pager trägt, baut Betreibbarkeit gleich ein. **1 System = 1 Team:** jedes System hat genau ein verantwortliches Team — keine Grauzonen, keine geteilte Verantwortung, die am Ende niemand trägt. *Im Artefakt sichtbar (dann geerdet):* ein Dienst, den das Team betreiben soll, ohne Observability/Health-Probes/Runbook (`engineering-craft.md` §4) — E2E-Verantwortung schließt die Betreibbarkeit ein.

### Platform Engineering als Enabler

Eine interne Plattform senkt die kognitive Last der Produktteams: **goldene Pfade / paved roads** (der einfache Weg ist der richtige), Self-Service statt Tickets, **Plattform als Produkt** mit echten Nutzern — den Entwickler:innen. Team-Topologie: ein Platform-/Enabling-Team *befähigt* die stream-aligned Produktteams, statt zum Flaschenhals zu werden. *Im Review-Kontext:* Nutzt der Dienst die etablierten Plattform-Fähigkeiten (CI/CD, Observability, IaC — `engineering-craft.md` §4), oder baut er daran vorbei sein eigenes Ding (Wildwuchs, Abweichung ohne Grund — SKILL.md „Industrie-Standards vor Eigenbau")?

### Conway's Law — Teamschnitt wird Systemschnitt

„Organisationen bilden Systeme, deren Struktur ihre Kommunikationsstruktur spiegelt." Der Teamschnitt prägt die Architektur, ob gewollt oder nicht: Teams entlang fachlicher Domänen geschnitten → modulare Systeme mit sinnvollen Grenzen; entlang technischer Schichten oder zufälliger Linien geschnitten → ein verflochtener Monolith, in dem jede Änderung alle betrifft. Das ist kein Fluch, sondern ein Hebel — wer die gewünschte Architektur kennt, baut die passende Organisation. Die technische Kehrseite (Grenzen, Kohäsion, Kopplung) bewertet `architecture-and-domain.md`.

## Worked Examples

**Beispiel 1 — Bus-Faktor 1, im Artefakt sichtbar (geerdet → normaler Bucket, „Sollte behoben werden")**

```
# git log --format='%an' -- src/pricing/RiskEngine.java | sort -u
Jane Doe        # einziger Autor über 3 Jahre; kein Test, kein README, keine ADR
```
→ *Warum:* Ein geschäftskritisches Modul hängt an einer Person (Bus-Faktor 1) — bei jeder Abwesenheit blockiert, und niemand kann es sicher ändern (`philosophy-of-software-design.md`: Unknown Unknowns). Weil im git-blame/Testbestand *sichtbar*, ist es ein geerdeter Fund, kein reines Kultur-Thema.
→ *Vorschlag:* Charakterisierungs-Tests als Sicherheitsnetz (`engineering-craft.md` §2), dann Pairing/Mobbing zum Wissenstransfer, Kern-Entscheidungen als ADR festhalten.

**Beispiel 2 — Nicht-lehrende PR (geerdet an der PR selbst)**

```
Title: fix
Description: (leer)     # 480 Zeilen über 14 Dateien
```
→ *Warum:* Der Reviewer muss die Absicht rekonstruieren; das Review wird oberflächlich oder blockiert (`engineering-craft.md` §5: das *Warum* gehört in die Beschreibung). Ein 480-Zeilen-Diff ohne roten Faden ist zusätzlich schwer reviewbar.
→ *Vorschlag:* PR aufteilen, je Teil Kontext/Motivation/Risiko/„worauf schauen" ergänzen.

*(Eine rein kulturelle Empfehlung ohne Fundstelle — etwa „richtet eine Community of Practice für das Pricing-Wissen ein" — gehört **nicht** als Finding hierher, sondern in die separate Ausgabe-Kategorie „Zusammenarbeit & Kultur".)*

## Review-Fragen (Checkliste)

- Hängt ein kritischer Bereich an einer einzigen Person (Bus-Faktor), ohne Tests/Doku?
- Ist die Review-Kultur blameless und an der Sache — oder Gate/Rubber-Stamping?
- Lehrt die PR-Beschreibung (Kontext, Warum, Risiko), oder muss der Reviewer raten?
- Sind folgenreiche Entscheidungen als ADR festgehalten (geteiltes Gedächtnis)?
- Kommt ein Neuer in Minuten zum Laufen und findet sich zurecht?
- Wird Wissen aktiv geteilt (Pairing/Mobbing, Guild/CoP, gemeinsame DoD/Guidelines)?
- Trägt das Team E2E-Verantwortung — inkl. Betreibbarkeit — oder endet sie am Deploy?
- Nutzt der Dienst die etablierten Plattform-Fähigkeiten (paved roads), oder baut er daneben sein eigenes?
