# Linse (d): Frontend — Konsistenz, UX-Qualität, Angular-Handwerk

*Wann lesen:* wenn UI-Code im Scope ist — Angular-Komponenten, Templates, Frontend-State, Formulare. Diese Linse **nur** fächern, wenn es tatsächlich ein Frontend gibt; für ein reines Backend/eine Bibliothek entfällt sie.

**Vorab (Joachims Rahmung):** Der Kontext sind **interne Angular-Apps** — Fachanwendungen für Mitarbeitende, keine kundenseitigen, gesetzlich regulierten Produkte. Deshalb ist A11y hier **Qualitäts- und UX-Anspruch** ("sollte behoben werden"), kein Compliance-Blocker. Was zählt, sind drei Säulen: **Konsistenz, UX-Qualität, Angular-Handwerk.** Prinzipienzuerst; die Angular-Spezifika sind die Taktiken darunter, so wie backendseitig Kafka/Avro die Taktiken sind.

Dieselben Grundprinzipien wie im Backend gelten weiter: Komponenten sind **Module** und wollen *tief* sein (`philosophy-of-software-design.md`); ihre `@Input`/`@Output` sind eine **Schnittstelle** wie jede API (`engineering-craft.md`); Duplikation und schlechte Namen kosten hier genauso (`clean-code.md`).

---

## Säule 1 — Konsistenz

Das teuerste Frontend-Problem in einer wachsenden App ist nicht der einzelne Bug, sondern **zehn leicht verschiedene Lösungen für dasselbe Problem**. Jede Sonderlocke erhöht die Cognitive Load und die Wartungslast.

- **Design-System / Component-Library wiederverwenden**, statt Buttons, Dialoge, Tabellen, Formularfelder pro Feature neu zu bauen. Gibt es eine Haus-Library (Material, ein internes Wrapper-Kit)? Wird sie genutzt oder umgangen?
- **Ein Muster pro Problem.** Gleiche Probleme (Laden, Fehler anzeigen, bestätigen, paginieren) sollen überall *gleich* gelöst sein. Wildwuchs hier ist Change Amplification: das Fehler-Handling an 12 Stellen anfassen, weil jede es anders macht.
- **Einheitliche Struktur.** Ordner-/Datei-Konventionen, Namensschema für Komponenten/Services, gleiche Art, State zu halten. Ein Neuer soll sich nach einem Feature im nächsten sofort zurechtfinden.

---

## Säule 2 — UX-Qualität

Auch eine interne App wird täglich benutzt — schlechte UX kostet echte Arbeitszeit und Nerven. Das "Handwerkliche" der UI:

- **Die drei Zustände immer bedenken:** Loading, Error, Empty — nicht nur den Happy Path mit vollen Daten. Ein Screen, der beim Laden weiß bleibt, bei Fehler leer bleibt und bei null Treffern wie ein Bug aussieht, ist unfertig.
- **Feedback bei Aktionen.** Speichern/Löschen/Absenden gibt sichtbare Rückmeldung (Spinner, Toast, disabled Button gegen Doppel-Submit). Der Nutzer soll nie raten, ob etwas passiert ist.
- **Formular-Validierung, die hilft statt bestraft.** Fehler am richtigen Feld, in klarer Sprache, zum richtigen Zeitpunkt (nicht schon beim ersten Fokus, aber vor dem Absenden). Keine kryptischen Codes.
- **Keine blockierende/ruckelige Interaktion.** Lange Operationen async mit Feedback; keine eingefrorene UI. Optimistische Updates, wo sinnvoll.
- **Sinnvolle Defaults & Tastaturbedienbarkeit** — bei Fachanwendungen, die den ganzen Tag benutzt werden, ist Effizienz (Enter zum Absenden, sinnvolle Tab-Reihenfolge, Fokus-Management nach Aktionen) echter UX-Wert.
- **A11y & i18n eingewoben (Qualität, "sollte behoben werden"):** semantisches HTML (`<button>` statt klickbares `<div>`), Labels an Feldern, ausreichender Kontrast, Fokus sichtbar — kostet fast nichts, wenn man es gleich macht, und hilft *allen*. Keine hartcodierten Anzeigetexte, wenn die App mehrsprachig ist (im Schweizer Kontext oft DE/FR/IT) — Texte über den i18n-Mechanismus, Datums-/Zahlen-/Währungsformate lokalisiert.

---

## Säule 3 — Angular-Handwerk

Die stack-spezifischen Taktiken, an denen sich in Angular die Qualität entscheidet:

- **Komponenten als tiefe Module.** Eine Komponente verbirgt ihre Interna hinter einer schmalen `@Input`/`@Output`-Schnittstelle. Smart/Container-Komponenten (holen Daten, kennen Services) von Dumb/Presentational-Komponenten (nur `@Input` rein, `@Output` raus, kein Service) trennen — das macht Dumb-Komponenten trivial testbar und wiederverwendbar. Standalone Components bevorzugen.
- **Change Detection bewusst:** `ChangeDetectionStrategy.OnPush` als Default; **Signals** für lokalen State statt Zoo aus manuellen Subscriptions. Gießkannen-Change-Detection (Default-Strategy überall, Funktionsaufrufe im Template) ist ein Performance-Smell.
- **RxJS-Leaks vermeiden.** Manuelle `.subscribe()` ohne Aufräumen leaken. Bevorzugt die **`async`-Pipe** im Template (räumt selbst auf) oder `takeUntilDestroyed()`. Ein `.subscribe()` in `ngOnInit` ohne Unsubscribe ist ein konkreter Fund.
- **Keine Logik im Template.** Komplexe Ausdrücke, Funktionsaufrufe (`{{ berechne(x) }}` läuft bei jeder Change Detection), verschachtelte Ternaries → in die Komponente/ein `computed()`/eine Pipe. Templates deklarieren, sie rechnen nicht.
- **Reactive Forms** für alles jenseits des Trivialen (typisiert, testbar, validierbar) statt Template-Driven Forms; Validierung deklarativ.
- **Lazy-loaded Routes** für Feature-Bereiche, damit das initiale Bundle klein bleibt.
- **`HttpClient` hinter einem Service**, nicht in der Komponente — das ist der DIP/ACL-Gedanke (`clean-code.md`) auf der Frontend-Seite und macht die Komponente testbar.

---

## Worked Examples

**Beispiel 1 — RxJS-Leak + Logik im Template (Sollte behoben werden)**

```typescript
@Component({ /* keine OnPush-Strategy */ })
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  ngOnInit() {
    this.http.get<Order[]>('/api/orders').subscribe(o => this.orders = o); // Leak + HttpClient in Komponente
  }
  total(o: Order) { return o.items.reduce((s, i) => s + i.price, 0); }      // im Template aufgerufen
}
```
```html
<div *ngFor="let o of orders">{{ o.name }}: {{ total(o) }}</div>  <!-- total() läuft bei JEDER Change Detection -->
```
→ *Warum:* Die Subscription wird nie aufgeräumt (Leak). `HttpClient` steckt in der Komponente (untestbar, DIP-Verstoß). `total()` im Template rechnet bei jeder Change Detection neu. Kein Loading/Error/Empty-State.
→ *Vorschlag:* Daten über `OrderService` holen, im Template per `async`-Pipe binden (`orders$ | async`), `OnPush`, Summe als `computed()`/vorberechnetes Feld, plus Loading/Error/Empty behandeln.

**Beispiel 2 — Konsistenz-Bruch (Zur Überlegung / Sollte, je nach Ausmaß)**

```typescript
// Feature A baut sein eigenes Bestätigungs-Modal von Hand,
// Feature B nutzt window.confirm(), Feature C das Material-Dialog-Kit.
```
→ *Warum:* Drei Lösungen für "Bestätigen" — inkonsistente UX, dreifache Wartung, und die Design-System-Komponente wird umgangen.
→ *Vorschlag:* Auf *ein* Muster einigen (die Haus-Dialog-Komponente), die anderen zwei angleichen. Das ist DRY/tiefe Module auf UI-Ebene.

## Review-Fragen (Checkliste)

- Wird das Design-System/die Component-Library genutzt — oder werden Standard-Bausteine pro Feature neu erfunden?
- Ist dasselbe Problem (Laden, Fehler, Bestätigen, Paginieren) überall gleich gelöst?
- Sind Loading-, Error- und Empty-State bedacht — oder nur der Happy Path?
- Bekommt der Nutzer Feedback bei Aktionen, und schützt die UI vor Doppel-Submit?
- Sind Komponenten in Smart/Dumb getrennt, mit schmaler `@Input`/`@Output`-Schnittstelle?
- Läuft Change Detection über `OnPush`/Signals — oder per Gießkanne mit Funktionsaufrufen im Template?
- Werden Subscriptions aufgeräumt (`async`-Pipe / `takeUntilDestroyed`)?
- Steckt Rechen-/Datenlogik in Templates oder in Komponenten/Services?
- Semantisches HTML, Labels, Kontrast, Tastaturbedienung bedacht? Anzeigetexte über i18n statt hartcodiert?
