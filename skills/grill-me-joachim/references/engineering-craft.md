# Linse (c): Handwerk — Schnittstellen, Testing, Dokumentation, DevOps/Platform, VCS & KI-Code

*Wann lesen:* für alles jenseits des reinen Codes im Kleinen — die Nähte zwischen Komponenten, ob das Ding testbar/betreibbar/verständlich ist. Das ist der Teil, den man am leichtesten übersieht und der im Betrieb am teuersten wird.

Sechs Bereiche. Kalibriere jeden am Pragmatismus-Regler (SKILL.md): ein Spike braucht keine Circuit Breaker, eine Plattform-Komponente schon. Zwei Dinge gelten aber **immer** als Blocker: **Secrets im Repo** und **gebrochene Contracts**.

---

## 1. Schnittstellen & API-Design

Die Schnittstelle ist der Vertrag mit allen Nutzern — sie zu ändern kostet *sie*, nicht nur dich. Deshalb ist Schnittstellendesign die teuerste Stelle, an der man schludern kann.

- **Aus Sicht des Konsumenten denken.** Ist der häufige Fall *ein* einfacher Aufruf? Sind Defaults sinnvoll? Muss man die Interna kennen, um sie richtig zu benutzen? (Bezug zu Linse a: eine gute API ist ein tiefes Modul.)
- **Kohäsion hoch, Kopplung niedrig.** Gehört alles an dieser Schnittstelle wirklich zusammen?
- **Rückwärtskompatibilität & Versionierung.** Additive Änderungen bevorzugen (Feld hinzufügen statt umbenennen/entfernen). Breaking Changes brauchen eine Version und eine Deprecation-Policy. Einen bestehenden Contract *still* zu brechen ist ein **Blocker**.
- **Klare Fehler-Semantik am Rand:** definierte Fehlerform (Statuscodes/Fehler-Payload), keine Stacktraces nach außen, keine internen Details leaken.
- **Idempotenz**, wo Wiederholungen möglich sind (Retries, At-least-once). **Limits/Pagination** statt unbeschränkter Rückgaben.
- **REST:** konsistente Ressourcenmodellierung, korrekte Statuscodes, einheitliche Fehler-Payloads, sinnvolle Idempotenz bei `PUT`/`DELETE`.
- **Events / Kafka (relevant im Stack):** Schema mit Registry (z. B. Avro), bewusste Compatibility-Modes (backward/forward/full), durchdachte Keys/Partitionierung, **idempotente Consumer** bei At-least-once-Semantik, Umgang mit Poison Messages (Dead-Letter). Ein Event-Schema ist ein Contract wie jede API.
- **Anti-Corruption Layer** um Legacy-/Fremdsysteme — im Modernisierungskontext (Strangler Fig, CDC/Debezium) die Naht, an der die neue Welt sauber bleibt.

*Review-Fragen:* Was passiert mit bestehenden Aufrufern, wenn dieser Diff live geht? Ist der häufige Fall einfach? Sind Fehler und Grenzen (Limits, Timeouts) am Rand klar definiert?

---

## 2. Testing

Tests sind erstklassiger Code und werden so reviewt (Namen, Klarheit, keine Duplikation).

- **Testpyramide:** viele schnelle Unit-Tests, weniger Integrationstests, wenige E2E. Der umgekehrte Fall (viele langsame E2E, kaum Units — "ice-cream cone") ist ein Smell: langsam, flaky, teuer.
- **Verhalten testen, nicht Implementierung.** Tests, die bei jedem Refactoring brechen, obwohl das Verhalten gleich blieb, testen die falschen Dinge.
- **Lesbar:** Arrange–Act–Assert, ein logisches Konzept pro Test, sprechende Testnamen (die den Fall beschreiben).
- **F.I.R.S.T.:** **F**ast, **I**ndependent (keine Reihenfolge-Abhängigkeit, kein geteilter mutabler Zustand), **R**epeatable (deterministisch — keine `sleep`, keine echte Uhr/Zufall ohne Kontrolle, keine Netzabhängigkeit im Unit-Test), **S**elf-validating (grün/rot, kein manuelles Ablesen), **T**imely (mit dem Code, nicht Monate später).
- **Coverage ist ein Signal, kein Ziel.** 100 % zu jagen ist Verschwendung und lädt zu sinnlosen Tests ein (Goodhart: wird die Kennzahl zum Ziel, taugt sie nicht mehr als Maß). Aber: kritische Pfade, Grenzfälle und **Fehlerpfade** müssen abgedeckt sein — nicht nur der Happy Path. Frag nach der *Qualität* der Tests, nicht nur nach der Prozentzahl.
- **Test-Doubles gezielt:** an Architekturgrenzen mocken (externe Systeme, hinter deiner eigenen Schnittstelle), nicht Dinge mocken, die dir nicht gehören, ohne Wrapper. Für echte Logik lieber echte Kollaborateure. Für Integration mit DB/Broker: Testcontainers statt Mock-Fiktion.
- **Testbarkeit *ist* eine Design-Eigenschaft.** Schwer testbarer Code hat fast immer ein Design-Problem (versteckte Abhängigkeiten, statischer Zustand, God Objects) → DIP (Linse b). Wenn ein Test absurd aufwendig einzurichten ist, ist das ein Design-Fund, kein Test-Fund.

*Review-Fragen:* Testet das Verhalten oder die Implementierung? Sind Fehlerpfade und Grenzfälle abgedeckt? Sind die Tests deterministisch? Verrät die Schwierigkeit des Testens ein Design-Problem?

---

## 3. Dokumentation

- **Diátaxis** als Ordnungsrahmen: vier Modi mit *unterschiedlichen* Zwecken, die man nicht vermischt —
  - **Tutorials** (Lernen, an der Hand geführt),
  - **How-to-Guides** (ein konkretes Ziel erreichen),
  - **Reference** (nachschlagen, vollständig & trocken),
  - **Explanation** (Verstehen, Hintergrund & Warum).
  Ein häufiger Doku-Fund: ein Text, der Tutorial, Referenz und Erklärung vermischt und dadurch keinem Leserbedürfnis dient.
- **README, das einen Neuen in Minuten zum Laufen bringt:** was & warum, Quickstart, Build/Test/Run, Konfiguration, wie man beiträgt.
- **ADRs** (Architecture Decision Records) für folgenreiche Entscheidungen: Kontext → Entscheidung → Konsequenzen. Sie halten das *Warum* fest, damit spätere Maintainer es nicht neu ausdiskutieren.
- **Self-documenting Code + Kommentare für Absicht/Invarianten** (Brücke zu Linse a). Doku lebt nah am Code und wird aktuell gehalten — **veraltete Doku ist schlimmer als keine**, weil sie aktiv in die Irre führt.
- **Diagramme** für Architektur leichtgewichtig (z. B. C4-Ebenen), nur wo sie Verständnis stiften.

*Review-Fragen:* Kommt ein Neuer allein zum Laufen? Sind folgenreiche Entscheidungen als ADR festgehalten? Passt die Doku noch zum Code? Mischt ein Dokument mehrere Diátaxis-Modi?

---

## 4. DevOps & Platform-Engineering (Betreibbarkeit)

Die Frage hinter diesem Abschnitt: **Kann man das in Produktion betreiben, beobachten und im Fehlerfall verstehen — von außen?**

- **Config & Secrets (Twelve-Factor-Geist):** Konfiguration aus der Umgebung, strikt von Code getrennt. **Keine Secrets im Repo** — das ist ein **Blocker** (auch in History/`.env`-Beispielen). Aktiv danach suchen. Secrets über Vault/Secret-Store, nicht im Image.
- **Statelessness & Disposability:** Prozesse zustandslos, schneller Start, **graceful shutdown** (offene Requests/Consumer sauber beenden). Dev/Prod-Parität. Logs als Event-Stream (nach stdout), nicht in Dateien im Container.
- **Observability:** strukturiertes Logging mit Korrelations-/Trace-IDs, Metriken, Tracing (OpenTelemetry im Stack), Health-/Readiness-Probes, sinnvolle Log-Level. **Keine Secrets/PII in Logs.** Test: Könnte man einen Prod-Incident allein aus Logs/Metriken/Traces diagnostizieren?
- **CI/CD:** reproduzierbare Builds, Pipeline als Code, automatische Tests als Gate, schnelles Feedback, unveränderliche Artefakte, kurze/Trunk-nahe Branches, keine manuellen Deploy-Schritte.
- **Infrastructure as Code (IaC):** Infrastruktur ist **deklarativ, versioniert und reviewt wie Code** (Terraform o. Ä.), nicht per ClickOps in der Cloud-Konsole zusammengeklickt. Klickst du es einmal von Hand, ist es weder reproduzierbar noch nachvollziehbar. Auf IaC-Code gelten dieselben Standards wie auf App-Code: DRY (Module statt Copy-Paste), sprechende Namen, kein hartcodiertes Secret, `plan` vor `apply` als Review-Gate. **State** bewusst verwalten (Remote-State, Locking); Drift zwischen Code und Realität ist ein Fund. Umgebungen (dev/test/prod) aus *derselben* Quelle parametrisiert, nicht dreimal getrennt gepflegt.
- **Automatisierung als Grundhaltung:** **Was eine Maschine zuverlässig prüfen oder tun kann, gehört in die Pipeline — nicht in menschliche Disziplin.** Ein wiederkehrender manueller Schritt (Deploy von Hand, Format-Kommentare im Review, "denk dran, X laufen zu lassen") ist selbst ein Fund: er ist fehleranfällig, undokumentiert und blockiert bei Abwesenheit. Automatisierte Checks laufen parallel, geben Sekunden-Feedback und **entlasten** das menschliche Review, sodass es sich auf Design konzentriert statt auf Whitespace.
- **Sicherheit (Basics, kein volles Threat-Model):** Input-Validierung, AuthN/AuthZ am Rand, Dependency-Hygiene (Scan auf bekannte Schwachstellen, Dependencies aktuell halten, keine EOL/nicht mehr unterstützten Technologien, auf den org-weit standardisierten Stack setzen statt Technologie-Wildwuchs), Least Privilege, sichere Defaults, keine Secrets in Code/Logs. Offensichtliche Lücken (Injection, fehlende Autorisierung) sind Blocker.
- **Reliability:** Timeouts überall an I/O, Retries **mit Backoff + Idempotenz**, Circuit Breaker/Bulkheads wo nötig, Graceful Degradation, Resource-Limits, **keine unbeschränkten Queues/Speicher**. Fehler sind normal — degradiert das System gesittet oder fällt es hart um?
- **Betreibbarkeit:** Konfiguration dokumentiert, Alerts/Runbook fürs Nicht-Offensichtliche, Migrationen bewusst (reversibel oder forward-only, aber entschieden), Feature-Flags für riskante Rollouts.

*Kontext-Kalibrierung:* All das gegen den Regler. Ein Prototyp braucht weder Bulkheads noch ADRs. Eine Plattform-Komponente, auf die 40 Entwickler bauen, braucht das meiste davon — dort multiplizieren sich Betriebsfehler über alle Nutzer.

*Review-Fragen:* Liegen Secrets im Repo? Ist Config aus dem Code heraus? Kann man den Dienst in Prod von außen debuggen? Haben I/O-Aufrufe Timeouts und sinnvolles Fehlerverhalten? Ist der Build reproduzierbar und der Deploy automatisiert? Ist die Infrastruktur als Code versioniert — oder von Hand geklickt? Welcher wiederkehrende manuelle Schritt gehört automatisiert?

---

## 5. Change-Hygiene / VCS (wie die Änderung verpackt ist)

Das ist Meta — es geht nicht um den Code selbst, sondern darum, *wie er zum Review kommt*. Eine schlecht verpackte Änderung macht jedes Review schlechter, weil der Reviewer den roten Faden nicht mehr findet. **Konvention-agnostisch:** Es wird kein bestimmtes Format erzwungen. Hat das Repo eine Konvention (z. B. Conventional Commits), wird sie eingehalten — aber der Skill schreibt keine vor.

- **Kleine, fokussierte, reviewbare PRs.** Ein PR = ein logisches Thema. Ein 2000-Zeilen-PR, der Feature, Refactoring und Formatierung vermischt, ist praktisch nicht reviewbar — das ist ein **"sollte behoben werden"**, weil es echte Prüfung verhindert.
- **Atomare Commits.** Ein Commit = eine sinnvolle Einheit, die für sich baut. Kein "wip", kein "fix fix fix", keine Vermischung von unzusammenhängenden Änderungen in einem Commit.
- **Das *Warum* in der Message.** Der Diff zeigt *was* sich ändert; die Commit-/PR-Beschreibung erklärt *warum* — Kontext, Motivation, verworfene Alternativen. Das ist dieselbe Absicht-vor-Mechanik wie bei guten Kommentaren (Brücke zu Linse a/b).
- **Nichts Unzusammenhängendes reinmischen.** Ein Formatierungs-Sweep gehört in einen eigenen Commit/PR, nicht in den Feature-PR — sonst ertrinkt die eigentliche Änderung im Rauschen des Diffs.
- **Boy-Scout-Rule, mit Augenmaß.** "Hinterlasse den Code sauberer, als du ihn vorgefunden hast" — Sekundensachen ohne Verhaltensänderung (toter Code, Tippfehler, eine Magic Number direkt daneben) beim Vorbeikommen mitnehmen. **Aber:** klein und lokal, im Umfeld deiner Änderung; wird's größer (Umstrukturierung, Verhaltensänderung, viele Dateien), gehört es in einen *eigenen* PR — sonst leidet die Reviewbarkeit. Im Zweifel: eigener Commit (`chore: ...`), damit Funktions- und Aufräumänderung getrennt lesbar sind. Was du nicht sicher verstehst/testen kannst, fasst du *nicht* nebenbei an.
- **Keine generierten Artefakte / keine Secrets** im Commit (Letzteres ist ein **Blocker**, siehe oben und Abschnitt 4).

*Review-Fragen:* Lässt sich der Diff in vernünftiger Zeit prüfen, oder ist er zu groß/vermischt? Erklärt die Beschreibung das *Warum*? Ist eine Repo-Konvention vorhanden — und eingehalten?

---

## 6. KI-generierter Code

KI-Werkzeuge beschleunigen das Tippen, nicht das Denken. Für das Review heißt das: **KI-generierter Code durchläuft exakt dasselbe Review und dieselben Tests wie jeder andere Code** — keine Sonderbehandlung, kein Vertrauensvorschuss. Wer merged, verantwortet, was drinsteht, unabhängig davon, wer/was es getippt hat. Typische Funde in KI-Code: plausibel aussehende, aber falsche Randfälle; überflüssige Abstraktion/Speculative Generality; erfundene oder veraltete API-Nutzung; Tests, die nur den Happy Path abdecken. Prüfe KI-Code eher *strenger*, weil er flüssig und selbstsicher wirkt.

*Review-Frage:* Wurde generierter Code verstanden und geprüft — oder nur durchgewinkt, weil er kompiliert?

---

## Worked Examples

**Beispiel 1 — Fehlende Timeouts an I/O (Blocker/Sollte, je nach Regler)**

```java
var response = httpClient.send(request, BodyHandlers.ofString()); // kein Timeout gesetzt
```
→ *Warum:* Ohne Timeout hängt der Aufruf potenziell unbegrenzt; unter Last erschöpfen sich Threads/Connections und der Dienst fällt hart um statt gesittet zu degradieren (Abschnitt 4, Reliability).
→ *Vorschlag:* Connect- und Request-Timeout setzen (`HttpClient.newBuilder().connectTimeout(...)`, `HttpRequest ... .timeout(...)`), plus Retry-mit-Backoff nur bei *idempotenten* Aufrufen.

**Beispiel 2 — Test prüft Implementierung statt Verhalten (Sollte behoben werden)**

```java
verify(repo, times(1)).save(any());   // testet, DASS gespeichert wurde — nicht, WAS herauskommt
```
→ *Warum:* Der Test bricht bei jedem Refactoring, das dasselbe Verhalten anders erreicht, und sagt nichts über Korrektheit (`save` könnte den falschen Zustand speichern). Er testet die Mechanik, nicht das Ergebnis.
→ *Vorschlag:* Beobachtbares Verhalten prüfen — den gespeicherten Zustand per Captor/echtem Repository (Testcontainers) gegen die Erwartung assert-en. Interaktions-Verifikation nur, wo der Seiteneffekt *das* Verhalten ist (z. B. "Event wurde publiziert").
