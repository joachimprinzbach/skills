# Linse (a): Design & Komplexität — nach *A Philosophy of Software Design* (John Ousterhout)

*Wann lesen:* wenn es um den großen Schnitt geht — Modulgrenzen, Abstraktionen, Kopplung, ob eine Struktur in sechs Monaten noch tragbar ist. Das ist die wichtigste Linse; die anderen dienen ihr.

Alle Ideen hier in eigenen Worten zusammengefasst und für den Review-Gebrauch geordnet. Der Leitgedanke des Buches: **Das oberste Ziel guten Designs ist, Komplexität beherrschbar zu halten.** Fast alles andere folgt daraus.

## Was Komplexität überhaupt ist

Komplexität ist alles, was ein System schwerer verständlich oder schwerer änderbar macht. Sie ist das, was zählt — nicht Zeilenzahl, nicht Cleverness. Drei Symptome, an denen du sie im Review erkennst:

- **Change Amplification** — eine konzeptionell kleine Änderung zwingt dich, an vielen Stellen anzufassen. (Klassiker: dieselbe Konstante/Annahme mehrfach hartcodiert.)
- **Cognitive Load** — wie viel muss man im Kopf halten, um eine Stelle korrekt zu ändern? Weniger Code, der aber mehr Wissen voraussetzt, kann *komplexer* sein als mehr Code.
- **Unknown Unknowns** — man kann nicht erkennen, *was* man ändern muss, damit es korrekt bleibt. Das ist die schlimmste Form, weil sie erst als Bug in Produktion auffällt.

Komplexität entsteht **inkrementell** — sie sammelt sich Änderung für Änderung an. Deshalb hilft kein einmaliges großes Aufräumen, sondern nur kontinuierliche Disziplin. Im Review heißt das: auch die kleine Schludrigkeit benennen, weil sie sich summiert.

## Die zwei Quellen: Dependencies und Obscurity

- **Dependencies** — wenn Code A nicht isoliert verstanden/geändert werden kann, weil er von B abhängt. Dependencies lassen sich nie ganz vermeiden, aber minimieren und *sichtbar* machen.
- **Obscurity** — wichtige Information ist nicht offensichtlich (unklare Namen, verstreutes Wissen, implizite Annahmen, fehlende Doku zu Invarianten).

Jeder Fund lässt sich meist einer der beiden zuordnen. Das hilft, den *Vorschlag* zu schärfen: Dependencies reduziert man durch besseren Schnitt/Kapselung, Obscurity durch bessere Namen und Kommentare zur Absicht.

## Tiefe Module (das zentrale Werkzeug)

Ein Modul (Klasse, Funktion, Service) hat eine **Schnittstelle** und eine **Implementierung**. 

- Ein **tiefes Modul** verbirgt viel Funktionalität hinter einer einfachen Schnittstelle. Das ist der Idealfall: der Nutzen (versteckte Komplexität) ist groß, die Kosten (Schnittstelle, die man lernen muss) klein.
- Ein **flaches Modul** hat eine Schnittstelle, die fast so komplex ist wie seine Implementierung — ein dünner Wrapper, eine Pass-Through-Methode. Es kostet mehr, als es verbirgt.

**Classitis** — die Überzeugung, Klassen/Methoden müssten immer möglichst klein sein — erzeugt viele flache Module und damit *mehr* Gesamtkomplexität. Das ist der direkte Widerspruch zur naiven Lesart von Clean Code (siehe SKILL.md, Abschnitt "Wenn die Quellen sich widersprechen").

*Review-Frage:* Ist diese Abstraktion tief? Verbirgt sie echte Komplexität, oder reicht sie sie nur durch?

## Information Hiding & Leakage

Jedes Modul sollte eine Design-Entscheidung *kapseln*, sodass Nutzer sie nicht kennen müssen. **Leakage** liegt vor, wenn dieselbe Entscheidung in mehreren Modulen bekannt ist oder durch die Schnittstelle nach außen scheint. Häufigste Ursache: **temporal decomposition** — Struktur nach Ausführungsreihenfolge statt nach Wissen ("erst lesen, dann parsen, dann schreiben" als drei Klassen, obwohl das Format-Wissen an einer Stelle gehört).

*Review-Frage:* Welche Entscheidung kapselt dieses Modul? Taucht dieselbe Annahme (Dateiformat, Protokoll, Einheit) an mehreren Stellen auf?

## Komplexität nach unten ziehen

Es ist besser, wenn der *Implementierer* eines Moduls mit Komplexität lebt als seine *Nutzer* — es gibt mehr Nutzer als Implementierer. Ein schweres Problem einmal innen lösen, hinter einer sauberen Schnittstelle, statt es an jeden Aufrufer durchzureichen. Konfigurationsparameter, die die Entscheidung nur nach oben delegieren, sind oft ein Zeichen, dass man sich vor genau dieser Arbeit drückt.

## Fehler wegdefinieren ("define errors out of existence")

Ausnahmefälle sind ein Hauptreiber von Komplexität. Reduziere ihre *Anzahl*, indem du die Semantik so definierst, dass der vermeintliche Fehler zum Normalfall wird:

- `delete` auf einen nicht existierenden Schlüssel → No-op statt Exception.
- Substring über die Grenzen hinaus → auf die gültige Länge clampen statt zu werfen.

Ergänzend: **Exceptions aggregieren** (an einer Stelle behandeln statt an vielen) und **maskieren** (tieferliegende Fehler innen abfangen, sodass die Schnittstelle sauber bleibt). *Vorsicht:* Das ist kein Freibrief, echte Fehler zu verschlucken — Korrektheit geht vor. Es geht darum, *unnötige* Ausnahmefälle zu eliminieren, nicht darum, Probleme zu verstecken.

## Verschiedene Ebene, verschiedene Abstraktion

Benachbarte Schichten sollten *unterschiedliche* Abstraktionen bieten. Riecht es nach derselben Abstraktion auf zwei Ebenen, fehlt vermutlich eine Trennung — oder eine Schicht ist überflüssig. Zwei konkrete Smells:

- **Pass-Through-Methode** — reicht ihre Argumente nur an eine andere Methode weiter, ohne Wert hinzuzufügen.
- **Pass-Through-Variable** — wird durch viele Schichten durchgereicht, nur damit eine tiefe Schicht sie sieht.

## Kommentare als Teil des Designs

Kommentare sind hier *kein* Eingeständnis von Versagen, sondern erfassen, was Code nicht kann: die **Abstraktion** (was ein Modul tut, ohne wie), **Absicht**, **Invarianten**, **Einheiten**, **Constraints**. Zwei Ebenen: Schnittstellen-Kommentare (was & warum, für Nutzer) und Implementierungs-Kommentare (nur fürs Nicht-Offensichtliche). Praxis-Trick des Buches: **Kommentare zuerst schreiben** — wenn sich die Schnittstelle nicht knapp beschreiben lässt, ist das Design vermutlich zu komplex.

## Strategisch vs. taktisch

- **Taktisch** — nur das Feature zum Laufen bringen, Abkürzungen nehmen, Cruft anhäufen. Der "tactical tornado" produziert viel Code und viel Chaos.
- **Strategisch** — die Codebase ist dein Hauptasset; investiere *kontinuierlich* ein wenig in gutes Design. Kein großer Big-Design-Upfront, sondern viele kleine gute Entscheidungen plus gelegentliches Aufräumen im Vorbeigehen.

*Wichtige Abgrenzung (Joachims Pragmatismus):* Strategisch ≠ spekulativ. "Design it twice" (kurz Alternativen durchdenken, bevor man committet) und tiefe Module sind Investitionen; **spekulative Generalität** für Anforderungen, die es (noch) nicht gibt, ist Gold-Plating und verstößt gegen YAGNI. Der Unterschied: strategisch senkt die Komplexität *heute schon*, Spekulation erhöht sie für ein *vielleicht morgen*.

## Kontext-Kalibrierung

Tiefe Module und Information Hiding zahlen sich **am Rand ein, auf den viele bauen** (Plattform-Bibliothek, öffentliche/Team-API, Kern-Domänenmodell) am stärksten aus. Ein Blatt-Modul, das nur an einer Stelle benutzt wird, darf simpler sein. Verlange die volle Design-Strenge dort, wo die Fehlerkosten sich multiplizieren — nicht überall gleich.

## Review-Fragen (Checkliste)

- Wo ist die Komplexität konzentriert, und ist sie *nötig*?
- Welche Symptome siehst du — Change Amplification, Cognitive Load, Unknown Unknowns?
- Sind die zentralen Module tief, oder gibt es flache Wrapper / Pass-Throughs?
- Welche Design-Entscheidung kapselt jedes Modul? Wo leakt Wissen (dieselbe Annahme an mehreren Stellen)?
- Wird Komplexität nach unten gezogen oder an die Aufrufer delegiert?
- Gibt es unnötige Ausnahmefälle, die man wegdefinieren könnte?
- Bieten benachbarte Schichten wirklich verschiedene Abstraktionen?
- Halten Kommentare die *Absicht/Invarianten* fest, oder wiederholen sie nur den Code?
- Ist das strategisch investiert — oder taktisch geschludert bzw. spekulativ übergeneralisiert?
