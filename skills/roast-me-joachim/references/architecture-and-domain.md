# Linse (a, Teil 2): Architektur & Domänenmodellierung

*Wann lesen:* Begleiter zu `philosophy-of-software-design.md`, wenn es um den **großen Schnitt einer Anwendung** geht — wie ist das Ganze in Schichten/Kontexte/Adapter zerlegt, zeigen die Abhängigkeiten in die richtige Richtung, und passt der gewählte Stil zur Komplexität der Domäne? Ousterhout liefert die Denkweise (Komplexität senken); diese Datei wendet sie auf Architektur und Fachmodell an.

**Vorab (Joachims Rahmung):** Es wird **nicht** geprüft, ob ein bestimmtes Muster "korrekt" umgesetzt ist — nicht jeder macht DDD, und das ist völlig in Ordnung. Layered, Ports & Adapters (Hexagonal), Clean/Onion und DDD sind alles legitime Optionen. Bewertet wird der **rote Faden**, an dem *jede* dieser Optionen gemessen wird: **Grenzen, Abhängigkeitsrichtung, Fit und Konsistenz.** Ein sauber durchgezogenes Layered ist besser als ein halb verstandenes Hexagonal.

## Der rote Faden (pattern-agnostisch)

### 1. Grenzen & Abhängigkeitsrichtung (die Dependency Rule)

Der universelle Fund, unabhängig vom Stil: **Abhängigkeiten zeigen nach innen.** Die Fachlogik (Domäne/Use Cases) kennt keine Infrastruktur — nicht das ORM, nicht das Web-Framework, nicht Kafka, nicht die konkrete DB. Umgekehrt: Infrastruktur hängt von der Domäne ab, nie andersherum.

- **Sickert Infrastruktur in die Fachlogik?** JPA-Annotationen auf dem Domänenobjekt, `HttpServletRequest` im Service, ein Kafka-`ConsumerRecord`, das bis in die Geschäftsregel durchgereicht wird — das koppelt den Kern an austauschbare Ränder und macht ihn untestbar.
- **Abstraktionen gehören dem Kern, Implementierungen dem Rand.** Das Interface (`OrderRepository`) lebt in der Domäne, die Implementierung (`JpaOrderRepository`) im Infrastruktur-Ring (DIP, siehe `clean-code.md`).
- **Nähte sichtbar machen.** Wo die neue Welt an Legacy/Fremdsysteme grenzt: Anti-Corruption Layer (siehe `engineering-craft.md` und `clean-code.md`) — die Naht, an der der Kern sauber bleibt.

**Qualität des Schnitts (deployment-agnostisch).** Modularer Monolith *und* Microservices sind beide legitim — bewertet wird die **Qualität des Schnitts**, nie die Deployment-Topologie:

- **Hohe Kohäsion innen, niedrige Kopplung außen.** Was fachlich zusammengehört, liegt zusammen; über die Grenze fließt wenig und nur Bewusstes.
- **Ein Modul = ein Änderungsgrund** (SRP auf Modulebene, `clean-code.md`). Ändert sich ein Modul aus mehreren unzusammenhängenden Gründen, ist der Schnitt falsch (Divergent Change).
- **Fan-in/Fan-out bewusst, keine Zyklen.** Zyklische Modulabhängigkeiten sind ein Fund — sie machen Module untrennbar und Änderungen unvorhersehbar.
- **Grenzen als Test erzwingen:** `ArchUnit` hält erlaubte Abhängigkeitsrichtung und Zyklenfreiheit grün (Toolchain: `clean-code.md`).

### 2. Fit statt Mode

Passt der Aufwand zur Komplexität der Domäne? Architektur ist eine Investition, die sich erst ab einer gewissen Komplexität auszahlt.

- **Over-Engineering:** volles Hexagonal mit Ports, Adaptern und Mappern um eine CRUD-Tabelle, die nur Felder durchreicht. Das ist Komplexität ohne Gegenwert (YAGNI). Für eine simple Ecke reicht ein schlanker Layered-Schnitt.
- **Under-Engineering:** ein God-Service mit 2000 Zeilen, der Web, Fachlogik und Persistenz vermischt, für eine echte Kern-Domäne mit vielen Regeln. Hier fehlt der Schnitt, den die Komplexität rechtfertigt.
- **Kern vs. Rand unterscheiden:** die komplexe Kern-Domäne verdient Sorgfalt (evtl. taktisches DDD), die generische Support-Ecke (Adressverwaltung, Stammdaten-CRUD) nicht. Nicht die ganze App über einen Kamm scheren.

### 3. Konsistenz

Ist *ein* Muster durchgezogen, oder mischt jede Ecke ihr eigenes? Zehn Entwickler, zehn Architekturen im selben Repo ist teurer als ein mittelmäßiges, aber einheitliches Muster — weil jeder neue Leser bei jedem Modul neu lernen muss (Cognitive Load, siehe `philosophy-of-software-design.md`).

### 4. Qualitätsziele (-ilities) & bewusste Trade-offs

Architektur wird von den nicht-funktionalen Qualitätszielen getrieben, nicht nur von Features: Performance, Skalierbarkeit, Verfügbarkeit, Sicherheit, Wartbarkeit, Observability. Diese Ziele stehen in **Spannung** zueinander — mehr Konsistenz kostet Verfügbarkeit, mehr Flexibilität kostet Einfachheit. **Architektur ist die Summe der bewussten Trade-off-Entscheidungen.** Der Fund ist selten "falsch entschieden", sondern **folgenreich entschieden, ohne dass die Abwägung sichtbar ist**: kein ADR, kein Wort dazu, warum diese Qualität der anderen vorgezogen wurde. Verlange die sichtbare Abwägung dort, wo die Entscheidung teuer rückgängig zu machen ist.

## DDD als *eine* Option

DDD ist mächtig, wo die Domäne fachlich komplex ist — und Ballast, wo sie es nicht ist. Nur einfordern, wo die Kern-Domäne es rechtfertigt.

### Strategisch (der wertvollere Teil)

- **Ubiquitous Language.** Der Code spricht die Sprache der Fachexperten — `Police`, `Deckung`, `Schadenfall`, nicht `DataObject1`, `Manager`, `flag2`. Direkter Bezug zu Naming-Konsistenz (`clean-code.md`): dieselbe Sache heißt im Code, im Gespräch und im Ticket gleich. Ein Bruch hier ist Obscurity in Reinform.
- **Bounded Contexts.** Ein Begriff kann in zwei Kontexten *verschieden* bedeuten (ein "Kunde" im Vertrieb ≠ ein "Kunde" in der Schadenabwicklung). Grenzen bewusst ziehen, statt ein überdehntes gemeinsames Modell durch die ganze Firma zu zwingen. Fachliche Grenzen = Modulgrenzen.

### Taktisch (nur wo strategisch schon sitzt)

- **Aggregates & Invarianten.** Ein Aggregat schützt eine Konsistenzregel: Zustandsänderungen laufen über die Wurzel, sodass die Invariante nie verletzt werden kann. Falsch geschnittene Aggregates (zu groß → Contention/lange Transaktionen; zu klein → Invariante nicht schützbar) sind der häufigste taktische Fund.
- **Entities vs. Value Objects.** Value Objects (`Money`, `Iban`, `Zeitraum`) sind unveränderlich und über ihren Wert gleich — das direkte Gegenmittel zu Primitive Obsession (`clean-code.md`).
- **Domain Events** als fachliche Tatsachen (`SchadenGemeldet`) statt technischer CRUD-Meldungen. Ein Domain Event ist ein Contract wie jede API (siehe `engineering-craft.md`).

### Der Haupt-Smell: Anemic Domain Model

Klassen mit nur Gettern/Settern und *ohne* Verhalten, während die Fachlogik in "Service"-Klassen daneben liegt. Das ist prozedurale Programmierung im OO-Kostüm: die Daten wissen nicht, welche Regeln für sie gelten, und dieselbe Regel wird über mehrere Services dupliziert (Change Amplification). *Gegenmittel:* Verhalten zu den Daten holen (Tell, don't ask). **Aber:** In einer echten CRUD-Ecke ist ein "anämisches" Modell völlig okay — der Smell zählt nur dort, wo es *echte* Fachregeln gibt.

## Worked Examples

**Beispiel 1 — Infrastruktur sickert in den Kern (Blocker/Sollte, je nach Regler)**

```java
// domain/Order.java
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue Long id;
    @Column BigDecimal total;          // Geld als BigDecimal → Primitive Obsession
    // ... Fachlogik, die jetzt an JPA gekettet ist
}
```
→ *Warum:* Die Domäne hängt am ORM (Dependency Rule verletzt) — jeder JPA-Wechsel oder Test schleppt Hibernate mit; die Invarianten des Fachmodells stehen im Persistenz-Objekt. `BigDecimal total` ist zudem Primitive Obsession.
→ *Vorschlag:* Reines Domänen-`Order` (POJO) mit `Money total`, Invarianten in der Domäne; separates `OrderEntity` im Infrastruktur-Ring mit den JPA-Annotationen; Mapping im Repository-Adapter. In einer simplen CRUD-Ecke darfst du dir das sparen — dann aber bewusst und einheitlich.

**Beispiel 2 — Anemic Domain Model + duplizierte Regel (Sollte behoben werden)**

```java
// Regel "Schaden nur meldbar, wenn Police aktiv" liegt in ZWEI Services:
class SchadenService { void melden(Police p, ...) { if (p.getStatus() != AKTIV) throw ...; } }
class BatchImport   { void importieren(Police p, ...) { if (p.getStatus() != AKTIV) skip(); } }  // dieselbe Regel, andere Deutung
```
→ *Warum:* Die Fachregel wohnt nicht bei `Police`, sondern verstreut in Services — Change Amplification (`philosophy-of-software-design.md`) und die zwei Kopien driften schon auseinander (`throw` vs. `skip`).
→ *Vorschlag:* `Police.kannSchadenMelden()` bzw. `police.meldeSchaden(...)` — die Regel wohnt bei den Daten, beide Aufrufer nutzen dieselbe. Value Object statt `getStatus()`-Vergleich.

## Review-Fragen (Checkliste)

- Zeigen die Abhängigkeiten nach innen — oder kennt die Fachlogik Framework/ORM/Broker?
- Passt der architektonische Aufwand zur Komplexität *dieser* Ecke (Kern vs. Support)? Over- oder Under-Engineering?
- Ist der Schnitt kohäsiv innen, lose gekoppelt außen und zyklenfrei — unabhängig von der Deployment-Topologie?
- Ist *ein* Muster konsistent durchgezogen, oder kocht jede Ecke ihr eigenes?
- Welche Qualitätsziele treiben die Architektur — und ist eine folgenreiche, teuer umkehrbare Entscheidung mit sichtbarer Trade-off-Begründung (ADR) versehen?
- Spricht der Code die Sprache der Fachexperten (Ubiquitous Language) — konsistent über Code, Ticket, Gespräch?
- Sind Bounded Contexts bewusst getrennt, oder wird ein überdehntes Modell durch alles gezwungen?
- Wo *echte* Fachregeln existieren: leben sie bei den Daten oder anämisch in Services? (In CRUD-Ecken kein Fund.)
- Sind Aggregate-Grenzen so geschnitten, dass sie eine Invariante schützen, ohne unnötig groß zu sein?
