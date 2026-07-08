# Linse (b): Code-Qualität im Detail — nach *Clean Code* (Robert C. Martin)

*Wann lesen:* für die Detailebene — Namen, Funktionen, Fehlerbehandlung, konkrete Code-Smells. Diese Linse liefert *Taktiken*; sie stehen im Dienst der Komplexitätsreduktion (Linse a), nicht über ihr.

Alle Punkte in eigenen Worten und für den Review gebündelt. **Vorab (Joachims Rahmung):** Clean Code ist wertvoll für Klarheit und Einzelverantwortung, aber einige seiner Regeln — vor allem "Funktionen müssen winzig sein" und "Kommentare sind Versagen" — sind zu Recht umstritten. Wende die *Absicht* an (Lesbarkeit, eine Verantwortung, geringe Kopplung), nicht den Buchstaben. Wenn eine Regel mit Ousterhout kollidiert, gewinnt "Komplexität senken" (siehe SKILL.md).

## Naming

- Namen sollen die **Absicht** verraten: was es ist, was es tut, wie man es benutzt. `elapsedTimeInDays` statt `d`.
- Keine Desinformation, keine kryptischen Abkürzungen, kein Hungarian/Typ-Präfix.
- Aussprechbar und suchbar. Ein-Buchstaben-Namen nur in engsten Scopes (Schleifenindex).
- **Konsistentes Vokabular** über die Codebase: nicht `get`/`fetch`/`retrieve` wild gemischt für dasselbe Konzept. Ein Begriff pro Konzept.
- Klassen = Substantive, Methoden = Verben; Namen so lang wie nötig, so kurz wie möglich.

*Obscurity-Bezug:* schlechte Namen sind die häufigste Quelle von Obscurity (Linse a). Namen sind billiges, hochwirksames Review-Feedback.

## Funktionen

- **Eine Sache tun**, auf **einer Abstraktionsebene**. Wenn eine Funktion "erst X, dann etwas ganz anderes Y" macht, ist das ein Trennungssignal.
- Klein *im Dienst der Klarheit* — aber **nicht** um eine Zeilenzahl zu treffen. (Hier explizit gegen Ousterhout abwägen: nicht in viele flache Methoden zerhacken. Zerlegen nur, wenn eine sinnvolle, tiefere Abstraktion herausfällt.)
- **Wenige Argumente.** 0–2 ideal, 3 mit Begründung, 4+ fast immer ein Smell → Parameter-Objekt einführen. **Flag-Argumente** (`doThing(true)`) vermeiden — sie verraten, dass die Funktion zwei Dinge tut; lieber zwei Funktionen.
- **Command-Query-Separation:** eine Funktion *tut* etwas oder *beantwortet* etwas, nicht beides.
- **Keine versteckten Nebenwirkungen.** Was der Name nicht ankündigt, soll nicht passieren.
- **DRY** — Duplikation ist ein Hauptfeind. *Aber:* voreiliges Wegabstrahieren zufälliger Ähnlichkeit ("false DRY") kann Kopplung erzeugen, die schlimmer ist als die Duplikation. Erst prüfen, ob es dieselbe *Entscheidung* ist oder nur zufällig gleicher Code.

## Fehlerbehandlung

- **Exceptions statt Fehlercodes.** Fehlercodes zwingen den Aufrufer, sofort zu prüfen, und vermischen Happy Path mit Fehlerpfad.
- **Kein `null` zurückgeben oder durchreichen.** Stattdessen `Optional`, leere Collection, oder ein typisiertes Abwesenheits-Objekt. `null` ist die Hauptquelle von NPEs und Unknown Unknowns.
- **Fail fast** und mit Kontext: die Exception soll sagen, *was* schiefging und *wobei*. Nackte `throw new RuntimeException()` ohne Botschaft sind wertlos.
- **Keine Exceptions verschlucken** (leerer catch). Wenn bewusst ignoriert, dann kommentiert *warum*.
- Happy Path und Fehlerbehandlung optisch/strukturell trennen (z. B. Guard Clauses am Anfang).
- *Brücke zu Ousterhout:* wo sich Ausnahmefälle **wegdefinieren** lassen (No-op statt Exception), ist das oft besser als sauberes Werfen — weniger Fälle = weniger Komplexität. Korrektheit bleibt aber die Grenze.

## Kommentare

- Erste Wahl: **ausdrucksstarker Code** (guter Name statt erklärendem Kommentar).
- **Aber** — und hier bewusst näher an Ousterhout als am Clean-Code-Dogma — behalte Kommentare, die *Absicht, Warum, Verträge, Invarianten, Einheiten, Warnungen, rechtliche Hinweise, TODOs mit Begründung* tragen. Solche Kommentare sind kein Versagen.
- Streiche **redundante Was-Kommentare** (`i++; // i erhöhen`), auskommentierten Code (das kann Git), veraltete/irreführende Kommentare (schlimmer als keine).

## Formatierung & Stil

- **Das gehört dem Linter/Formatter, nicht dem menschlichen Review.** Verbrauch hier kein Budget. Findest du viele Stilnits, ist die Empfehlung: Formatter (Spotless/Prettier o. Ä.) + Linter in CI einziehen.
- Menschlich relevant bleibt nur *vertikale Nähe/Reihenfolge*: Zusammengehöriges nah beieinander, aufgerufene Funktion unter der aufrufenden.

## Objekte, Daten & Kopplung

- **Objekte vs. Datenstrukturen:** Objekte verbergen Daten und exponieren Verhalten; Datenstrukturen exponieren Daten und haben kein Verhalten. Mischformen ("hybrid") sind ein Smell.
- **Law of Demeter / "tell, don't ask":** nicht durch Objektketten durchgreifen (`a.getB().getC().doThing()`) — das koppelt an die innere Struktur. Sag dem direkten Kollaborateur, was zu tun ist.

## SOLID (angewandt, nicht akademisch)

- **SRP** — ein Modul hat *einen Grund, sich zu ändern*. In der Praxis das nützlichste Prinzip: fragt "wer/was treibt Änderungen an diesem Code?". Mehrere Antworten → aufteilen.
- **OCP** — offen für Erweiterung, geschlossen für Modifikation; neue Fälle durch Hinzufügen, nicht durch Aufreißen bestehenden Codes. Nicht spekulativ überdehnen.
- **LSP** — Untertypen müssen sich wie ihr Basistyp verhalten; keine Überraschungen/geworfenen "not supported".
- **ISP** — keine fetten Schnittstellen, die Implementierer zu leeren Methoden zwingen; lieber schmale, rollenbasierte Interfaces.
- **DIP** — von Abstraktionen abhängen, nicht von Konkretem. Besonders relevant für **Testbarkeit** und für plattformseitige Austauschbarkeit (Adapter um Fremdsysteme).

## Grenzen zu Fremdcode

- Fremd-APIs hinter eine **eigene Schnittstelle** kapseln (Anti-Corruption Layer). Das schützt vor breiter Kopplung an eine Lib und macht Ersetzen/Testen möglich — im Legacy-/Migrationskontext (Strangler Fig) essenziell.
- **Learning Tests** für neue/aktualisierte Libs: kleine Tests, die *dein* Verständnis der Fremd-API festhalten und Regressionen bei Upgrades fangen.

## Code-Smells (kuratierte Shortlist fürs Review)

- Lange Parameterlisten → Parameter-Objekt.
- **Primitive Obsession** → eigenes Typ/Value-Object (z. B. `Money`, `Iban`) statt `String`/`BigDecimal` überall.
- **Feature Envy** → Methode interessiert sich mehr für die Daten einer anderen Klasse → verschieben.
- **Shotgun Surgery** → eine Änderung verstreut über viele Klassen (= Change Amplification aus Linse a).
- **Large Class / God Object** → zu viele Verantwortungen → SRP.
- **Inappropriate Intimacy** → zwei Klassen kennen zu viel voneinander.
- **Duplicated Code / Dead Code / Magic Numbers** → benannte Konstante, entfernen, DRY (mit obiger Vorsicht).
- **Speculative Generality** → ungenutzte Flexibilität → entfernen (YAGNI).

## Testabschnitt (F.I.R.S.T. — Details in engineering-craft.md)

Tests sind erstklassiger Code und werden mit demselben Anspruch reviewt. Kurz: **F**ast, **I**ndependent, **R**epeatable, **S**elf-validating, **T**imely. Für Testpyramide, Test-Doubles, Coverage-Fallen → `references/engineering-craft.md`.

## Review-Fragen (Checkliste)

- Verraten die Namen die Absicht, konsistent über die Codebase?
- Tut jede Funktion eine Sache auf einer Ebene — ohne versteckte Nebenwirkungen und ohne Flag-Argumente?
- Wird `null` zurückgegeben/durchgereicht? Fehlercodes statt Exceptions? Verschluckte Exceptions?
- Tragen Kommentare Absicht/Invarianten — oder wiederholen sie den Code, oder sind sie veraltet?
- Ist Duplikation echte Duplikation (dieselbe Entscheidung) oder nur zufällig gleicher Code?
- Welches SOLID-Prinzip ist verletzt — und *treibt* diese Verletzung reale Schmerzen (SRP zuerst)?
- Ist Fremdcode hinter einer eigenen Schnittstelle gekapselt?
- Welche der Smells oben treten auf, und lohnt sich die Behebung *im aktuellen Kontext*?
