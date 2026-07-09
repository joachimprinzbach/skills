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
- **KISS** — die einfachste Lösung, die das Problem *heute* löst; jede zusätzliche Komplexität muss sich rechtfertigen. Cleverness ist kein Selbstzweck, Klarheit schlägt Raffinesse. Das ist Ousterhouts Leitstern „Komplexität senken" auf Funktionsebene (Prinzip-Ebene: SKILL.md).

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

- **Das gehört dem Linter/Formatter, nicht dem menschlichen Review.** Verbrauch hier kein Budget. Findest du viele Stilnits, ist die Empfehlung: Formatter + Linter in CI einziehen, sodass falsch formatierter Code den Build bricht — Review dreht sich dann um Design, nicht um Leerzeichen.
  - *JVM-Werkzeugkasten (Beispiele):* **Spotless** (Formatierung, bricht den Build), **Checkstyle/PMD** (Methodengröße, Komplexität, Magic Numbers, `System.out`), **SpotBugs** (leerer `catch`, NPE-Risiken), **ArchUnit** (Architektur-/Injection-Regeln als Test), **JaCoCo** (Coverage-Gate), **maven-enforcer** (verbotene Dependencies). Frontend analog: **ESLint + Prettier**.
  - *Rollout:* neue Checks erst als Warnung, dann als hartes Gate — sonst wird die bestehende Codebase schlagartig rot. Erstformatierung in einen **eigenen** Commit ("nur Formatierung"), damit die History sauber bleibt.
- Menschlich relevant bleibt nur *vertikale Nähe/Reihenfolge*: Zusammengehöriges nah beieinander, aufgerufene Funktion unter der aufrufenden.

## Objekte, Daten & Kopplung

- **Objekte vs. Datenstrukturen:** Objekte verbergen Daten und exponieren Verhalten; Datenstrukturen exponieren Daten und haben kein Verhalten. Mischformen ("hybrid") sind ein Smell.
- **Law of Demeter / "tell, don't ask":** nicht durch Objektketten durchgreifen (`a.getB().getC().doThing()`) — das koppelt an die innere Struktur. Sag dem direkten Kollaborateur, was zu tun ist.
- **Kohäsion als Kriterium (konzeptionell, nicht metrik-dogmatisch):** Gehören die Dinge in einer Klasse/einem Modul wirklich zusammen, oder ist es ein Sammelsurium? Niedrige Kohäsion ist ein Aufteilungssignal — auf Modulebene der Schnitt selbst (`architecture-and-domain.md`). Jage keine Kohäsions-Metrik; das Urteil zählt.

## SOLID (angewandt, nicht akademisch)

- **SRP** — ein Modul hat *einen Grund, sich zu ändern*. In der Praxis das nützlichste Prinzip: fragt "wer/was treibt Änderungen an diesem Code?". Mehrere Antworten → aufteilen.
- **OCP** — offen für Erweiterung, geschlossen für Modifikation; neue Fälle durch Hinzufügen, nicht durch Aufreißen bestehenden Codes. Nicht spekulativ überdehnen.
- **LSP** — Untertypen müssen sich wie ihr Basistyp verhalten; keine Überraschungen/geworfenen "not supported".
- **ISP** — keine fetten Schnittstellen, die Implementierer zu leeren Methoden zwingen; lieber schmale, rollenbasierte Interfaces.
- **DIP** — von Abstraktionen abhängen, nicht von Konkretem. Besonders relevant für **Testbarkeit** und für plattformseitige Austauschbarkeit (Adapter um Fremdsysteme).

## Grenzen zu Fremdcode

- Fremd-APIs hinter eine **eigene Schnittstelle** kapseln (Anti-Corruption Layer). Das schützt vor breiter Kopplung an eine Lib und macht Ersetzen/Testen möglich — im Legacy-/Migrationskontext (Strangler Fig) essenziell.
- **Learning Tests** für neue/aktualisierte Libs: kleine Tests, die *dein* Verständnis der Fremd-API festhalten und Regressionen bei Upgrades fangen.

## Moderne Sprach-Idiome (Stack-spezifisch, hier: Java 17/21+)

Idiome sind Taktiken im Dienst von Klarheit, Immutabilität und Testbarkeit — nicht Selbstzweck. Im JVM-Stack lohnen sich als Default-Praktiken:

- **records** für DTOs/Value Objects statt Getter-Boilerplate — unveränderlich, `equals`/`hashCode`/`toString` gratis. Weniger Code, weniger Fehlerquellen.
- **Immutability als Default.** `final` Felder, keine Setter, wo nicht nötig. Threadsicher, vorhersehbar, leichter zu testen. Mutabilität ist die *begründete Ausnahme*.
- **`Optional<T>` statt `null`** als Rückgabe (Brücke zur Fehlerbehandlung oben). `null` durchreichen ist ein Fund.
- **sealed interfaces + pattern matching im `switch`** statt `instanceof`-Kaskaden — der Compiler erzwingt Vollständigkeit, ein ganzer Bug-Typ ("Fall vergessen") verschwindet.
- **Konstruktor- statt Field-Injection.** Abhängigkeiten offen sichtbar, ohne Framework/Reflection im Unit-Test instanziierbar, Felder `final`. Field-Injection versteckt Abhängigkeiten und macht Tests künstlich schwer (Brücke zu DIP).
- **Sichtbarkeit minimieren.** `public` ist eine bewusste Entscheidung, kein Default — jedes `public` ist ein Versprechen (Brücke zu Linse a: kleine Schnittstelle = tiefes Modul). Klassen, die nicht zur Vererbung gedacht sind, `final`.
- **Plattform-Bordmittel vor zusätzlicher Dependency.** Bevor eine Lib gezogen wird: kann die Standardbibliothek das (Streams, `Optional`, `java.time`, `List.of`)? Das ist die eine Seite des "kein Rad neu erfinden"-Prinzips (SKILL.md) — die *andere* ist: einen etablierten Standard/eine bewährte Lib nicht durch schlechteren Eigenbau ersetzen. Die Abwägung ist immer: verdient diese Dependency ihr Gewicht (CVEs, Wartung, Lernkurve)?

*Für andere Stacks sinngemäß:* das jeweils moderne, idiomatische Mittel des Ökosystems statt veralteter Boilerplate — die *Absicht* (Unveränderlichkeit, Ausdruckskraft, Compiler-Hilfe) überträgt sich.

## Code-Smells (kuratierte Shortlist fürs Review)

- Lange Parameterlisten → Parameter-Objekt.
- **Primitive Obsession** → eigenes Typ/Value-Object (z. B. `Money`, `Iban`) statt `String`/`BigDecimal` überall.
- **Feature Envy** → Methode interessiert sich mehr für die Daten einer anderen Klasse → verschieben.
- **Shotgun Surgery** → eine Änderung verstreut über viele Klassen (= Change Amplification aus Linse a).
- **Large Class / God Object** → zu viele Verantwortungen → SRP.
- **Inappropriate Intimacy** → zwei Klassen kennen zu viel voneinander.
- **Duplicated Code / Dead Code / Magic Numbers** → benannte Konstante, entfernen, DRY (mit obiger Vorsicht).
- **Speculative Generality** → ungenutzte Flexibilität → entfernen (YAGNI).
- **Data Clumps** → dieselben paar Felder/Parameter reisen immer zusammen (ein Typ, der geboren werden will) → zu einem Typ bündeln.
- **Repeated Switches** → dieselbe `switch`/`if`-Kaskade über denselben Typ taucht mehrfach auf → Polymorphie oder eine gemeinsame Map.
- **Divergent Change** → eine Klasse wird aus mehreren *unzusammenhängenden* Gründen geändert → aufteilen, sodass jedes Modul einen Änderungsgrund hat (Kehrseite von Shotgun Surgery, beides SRP).

## Testabschnitt (F.I.R.S.T. — Details in engineering-craft.md)

Tests sind erstklassiger Code und werden mit demselben Anspruch reviewt. Kurz: **F**ast, **I**ndependent, **R**epeatable, **S**elf-validating, **T**imely. Für Testpyramide, Test-Doubles, Coverage-Fallen → `references/engineering-craft.md`.

## Worked Examples

**Beispiel 1 — `null` durchreichen + verschluckte Exception (Blocker/Sollte)**

```java
public User findUser(String id) {
    try {
        return repo.load(id);
    } catch (Exception e) {
        return null;   // Fehler verschluckt + null als "kein Ergebnis"
    }
}
```
→ *Warum:* Der `catch` verschluckt jeden Fehler (auch echte, z. B. DB down) und tarnt ihn als "nicht gefunden". `null` wandert zum Aufrufer und wird dort zur NPE — Unknown Unknown (`philosophy-of-software-design.md`).
→ *Vorschlag:* `Optional<User>` für die legitime Abwesenheit; echte Fehler *werfen* lassen (fail fast mit Kontext), nicht abfangen. Wenn bewusst abgefangen wird, dann kommentiert *warum* und mit spezifischem Exception-Typ.

**Beispiel 2 — Flag-Argument = Funktion tut zwei Dinge (Zur Überlegung/Sollte)**

```java
void exportReport(Report r, boolean asPdf) {
    if (asPdf) { /* PDF-Pfad */ } else { /* CSV-Pfad */ }
}
```
→ *Warum:* Das `boolean` verrät, dass die Funktion zwei Dinge tut; der Aufruf `exportReport(r, true)` ist an der Aufrufstelle nicht lesbar (was ist `true`?).
→ *Vorschlag:* Zwei Funktionen — `exportReportAsPdf(r)` / `exportReportAsCsv(r)` — oder ein `ExportFormat`-Enum, wenn wirklich ein gemeinsamer Rahmen existiert. Command-Query sauber halten.

**Beispiel 3 — Primitive Obsession (Zur Überlegung)**

```java
void transfer(String fromIban, String toIban, BigDecimal amount, String currency) { ... }
```
→ *Warum:* IBAN als `String` (jede Validierung überall aufs Neue), Geld als `BigDecimal` + separatem `currency`-`String` (die zwei können auseinanderlaufen: 100 in welcher Währung?). Lange Parameterliste noch dazu.
→ *Vorschlag:* Value Objects `Iban` (validiert sich selbst bei Konstruktion) und `Money(amount, currency)` (hält beides zusammen). Signatur wird `transfer(Iban from, Iban to, Money amount)`.

## Review-Fragen (Checkliste)

- Verraten die Namen die Absicht, konsistent über die Codebase?
- Tut jede Funktion eine Sache auf einer Ebene — ohne versteckte Nebenwirkungen und ohne Flag-Argumente?
- Wird `null` zurückgegeben/durchgereicht? Fehlercodes statt Exceptions? Verschluckte Exceptions?
- Tragen Kommentare Absicht/Invarianten — oder wiederholen sie den Code, oder sind sie veraltet?
- Ist Duplikation echte Duplikation (dieselbe Entscheidung) oder nur zufällig gleicher Code?
- Welches SOLID-Prinzip ist verletzt — und *treibt* diese Verletzung reale Schmerzen (SRP zuerst)?
- Ist Fremdcode hinter einer eigenen Schnittstelle gekapselt?
- Welche der Smells oben treten auf, und lohnt sich die Behebung *im aktuellen Kontext*?
