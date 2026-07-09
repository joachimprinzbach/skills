# Report-Template — die HTML-Seite für `roast-this`

Reine **Darstellung**, keine Prüf-Logik. Skelett + Regeln; Inhalt an den konkreten Review anpassen (kleines Repo → weniger Kacheln/Charts, Plattform → mehr).

## Design-Haltung: helles Quality-Dashboard, nicht Terminal, nicht Journal

Das Deliverable liest ein Mensch — oft ein Stakeholder. Es sieht aus wie ein **Quality-Dashboard**: hell, scannbar, mit Stats und kleinen Grafiken. **Nicht dark**, **nicht techy-Terminal**, **nicht Magazin/Serif** (zu „journal", schlechter lesbar bei Dichte).

- **Klare Grotesk** (Hanken Grotesk) mit hohem Kontrast auf leicht warmer Near-White-Fläche. Keine Serif-Lesekolumne.
- **Zahlen führen:** KPI-Tiles, eine Severity-Verteilung, ein, zwei kleine Balken-Charts (Bus-Faktor, Branch-Alter). Fließtext kurz halten.
- **Marken-Wärme nur in der Chrome** (Ember-Akzent für Tag/Sektionsnummern/Inline-Code/Run-in-Labels). **Daten-Balken bleiben kühl (Blau)** — sonst verwechseln sie sich mit den warmen Status-Farben.

## dataviz-Regeln (verbindlich — s. dataviz-Skill)

- **Severity = Status-Palette**, nie „Series": Blocker→critical, Sollte→serious, Überlegung→warning, Nit→muted, Gut→good. Status trägt **immer Icon/Label**, nie Farbe allein (relief rule — warning/serious sind auf Hell sub-3:1).
- **Text/Zahlen in Ink**, nie in der Status-/Serienfarbe. Die Farbe trägt nur der Mark (Balken/Dot/Spine) daneben.
- **Magnitude-Balken** (Bus-Faktor, Alter): eine kühle Single-Hue (Blau), **deutlich distinkt von den Status-Farben**. Kein Rainbow, keine gecycelten Hues.
- **Mark-Specs:** dünne Marks, 4–6px runde Enden, 2px Surface-Gap zwischen Segmenten eines stacked bars, recessive Grid; **direkte Labels** (Counts an den Segmenten/Balken) statt Pflicht-Tooltips, damit die Seite auch statisch/gedruckt lesbar ist.
- **Legende** bei ≥2 Segmenten immer präsent.

## Harte Beleg-Regel (nicht verhandelbar)

**Jede Kennzahl, jede Kachel, jeder Balken und jeder Fund trägt seinen Beleg** — `datei:zeile` (Code) oder gh-/git-Ausgabe (Betrieb), sichtbar (`.src` / `.beleg`). Ohne Fundstelle **existiert der Eintrag nicht**. Zeige nur, was du gemessen hast (z. B. „9/11 Branches stale" nur, wenn du sie gezählt hast) — keine weichen Claims („besser als gedacht", „~250 Tests") ohne Quelle. Das trennt einen geerdeten Report von einer schönen Halluzination.

## Signal-Deckel (spiegelt SKILL.md §4)

Ein urteilender Tier trägt **max. ~5 flache Einträge**; mehr → verwandte Funde als *ein* Thema bündeln (Fundstellen im Beleg darunter). Die Severity-Verteilung oben macht die Balance sichtbar.

## Fonts & Rendering

- **Hanken Grotesk via Google-Fonts-`<link>`** + Fallback `system-ui,-apple-system,'Segoe UI',sans-serif`; IBM Plex Mono für Belege/Meta. Fallback trägt das Design offline. **Artifact-CSP** blockt externe Fonts → dann greift der System-Fallback; für volle Wirkung als lokale `.html` ausgeben.
- Ansonsten **self-contained** (CSS inline, keine externen Skripte/Bilder; Diagramme als ASCII/`<pre>` oder inline-SVG).
- **Responsive:** Seitenrahmen ~1120px; KPI-Grid `repeat(4,1fr)` → 2 auf schmal; Charts 2-spaltig → 1-spaltig; breite `<pre>` in `overflow-x:auto`; Body scrollt nie horizontal.
- **Default-Ausgabe:** lokale `.html` (`<projekt>-roast.html`); zum Teilen als Artifact anbieten (Font-Caveat).

## Palette (light)

```
--plane:#f4f0e8  --surface:#fdfcf8  --surface-2:#f6f3ec
--ink:#0b0b0b  --ink-2:#51504c  --muted:#8a877f  --grid:#e7e1d5  --border:rgba(11,11,11,.11)
Chrome-Akzent (warm):  --accent:#bc4a1e  --accent-deep:#973714
Daten-Balken (kühl):   --data:#2a78d6   --data-deep:#1c5cab
Status:  --critical:#d03b3b  --serious:#ec835a  --warning:#fab219  --good:#0ca30c  --nit/muted:#8a877f
```

## Abschnitte (feste Reihenfolge — High-Level zuerst, Findings zuletzt)

**Der Bericht öffnet IMMER mit der High-Level-Bewertung (positiv *und* negativ) plus der Prinzip-Einstufung; die konkreten Findings kommen erst danach.**

1. **Header** — Kicker (Ember-„Roast"-Tag), Subject (Repo/Modul, mono), **Verdikt als Headline** (kurze ehrliche These) + Verdikt-Absatz, Meta-Zeile (Stand · Scope · Kalibrierung · Betrieb-Quelle).
2. **Kurzfazit — Stärken UND Schwächen, immer zuerst:** zwei Karten nebeneinander (`.fazit.pos` grün / `.fazit.neg` rot), je 2–3 Bullets mit Fundstellen-Anker. Die Stärken werden **nicht** ans Ende vergraben.
3. **Bewertung nach Prinzip** — eine Zeile je Prinzip (**Clean Code · Clean Architecture & Design · Testing & Qualität · DevOps & Betrieb · Security · Wartbarkeit & Wissen**): Name · Ordinal-Meter (4 Stufen) · Rating-Wort (stark/solide/lückenhaft/riskant/kritisch) · einzeilige, verankerte Begründung. Farbe = Status der Einstufung (good/warning/serious/critical). Irrelevante Prinzipien weglassen.
4. **Kennzahlen** — Severity-Verteilung (stacked bar + Legende) neben Findings-nach-Domäne; darunter KPI-Reihe (4 Tiles: Ink-Zahl, Status-Dot, Meter, Beleg) und 1–2 Balken-Charts (Bus-Faktor, Branch-Alter), Daten-Hue kühl.
5. **Überblick** — System-Landkarte + Datenfluss (`<pre>`), knapp.
6. **Findings** — Tiers Blocker→Nit, je Fund: Severity-Pill + Titel + `.beleg`-Inset + **Warum → Vorschlag** (Run-in-Labels).
7. **Footer** — Meta + gh-Fallback-Fußnote (falls zutreffend).

*(Die Stärken leben im Kurzfazit oben — keine separate „Was gut ist"-Sektion am Ende mehr.)*

## Skelett (Kernstruktur — vollständiges CSS in einer gerenderten Beispieldatei; anpassen, nicht sklavisch kopieren)

```html
<!DOCTYPE html><html lang="de"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>&lt;PROJEKT&gt; — Roast</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{ /* Palette oben; --accent warm (Chrome), --data kühl (Balken), Status fix */
    --sans:'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;
    --mono:'IBM Plex Mono',Consolas,monospace; }
  body{font-family:var(--sans);background:var(--plane);color:var(--ink);font-size:16px;line-height:1.55}
  .wrap{max-width:1120px;margin:0 auto;padding:0 28px}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 1px 2px rgba(11,11,11,.04),0 12px 28px -22px rgba(11,11,11,.35)}
  .grid{display:grid;gap:16px} .g-kpi{grid-template-columns:repeat(4,1fr)} .g-charts,.g-summary,.g-fazit{grid-template-columns:1fr 1fr}
  @media(max-width:900px){.g-charts,.g-summary,.g-fazit{grid-template-columns:1fr}.g-kpi{grid-template-columns:repeat(2,1fr)}}
  /* .fazit.pos/.neg: Karte mit ✓/!-Kopf, Bullet-Liste, .a = mono Fundstellen-Anker */
  /* .dimrow: name | .dmeter (4× <i>, i.on{background:currentColor}) | .drate | Begründung+.a; Farbe via .r-good/.r-warn/.r-ser/.r-crit auf der Zeile */
  /* KPI-Tile: .val (Ink, tabular-nums, groß) · .dot (Status) · .meter · .src (mono Beleg) */
  /* stacked severity bar: flex, 2px gap, runde Enden, Count im Segment, Legende darunter */
  /* Magnitude-Balken: track + fill (var(--data)); Wert rechts (tabular-nums) */
  /* finding: border-left Severity (.f-crit/.f-ser/.f-warn/.f-nit), .pill, .beleg, .rat mit Run-in <b> */
  @keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .rise{animation:rise .55s cubic-bezier(.2,.7,.2,1) both}
  @media(prefers-reduced-motion:reduce){.rise{animation:none}}
</style></head><body><div class="wrap">
  <header>
    <div class="kicker"><span class="tag">Roast</span> Code + Betrieb · ein Review</div>
    <h1><span class="subj">&lt;PROJEKT&gt;</span>&lt;Verdikt-These.&gt;</h1>
    <p class="verdict">&lt;Verdikt: gut genug für den Zweck? roter Faden? Dringendes unmissverständlich.&gt;</p>
    <div class="meta"><span>Stand · <b>…</b></span><span>Scope · <b>…</b></span><span>Kalibrierung · <b>…</b></span></div>
  </header>

  <!-- 2. KURZFAZIT: immer zuerst, positiv UND negativ -->
  <div class="grid g-fazit">
    <div class="card fazit pos"><h3><span class="ic">✓</span>Stärken</h3>
      <ul><li>…Stärke… <span class="a">datei:zeile</span></li></ul></div>
    <div class="card fazit neg"><h3><span class="ic">!</span>Schwächen &amp; Risiken</h3>
      <ul><li>…Risiko… <span class="a">datei:zeile</span></li></ul></div>
  </div>

  <!-- 3. BEWERTUNG NACH PRINZIP -->
  <section><div class="sec-title"><span class="n">✦</span>Bewertung nach Prinzip</div>
    <div class="card dims">
      <div class="dimrow r-ser"><span class="dn">Clean Code</span>
        <span class="dmeter"><i class="on"></i><i class="on"></i><i></i><i></i></span>
        <span class="drate">Riskant</span>
        <span class="dr">…einzeilige Begründung… <span class="a">datei:zeile</span></span></div>
      <!-- weitere Zeilen: Clean Architecture & Design · Testing & Qualität · DevOps & Betrieb · Security · Wartbarkeit & Wissen -->
    </div></section>

  <!-- 4. KENNZAHLEN -->
  <section><div class="sec-title"><span class="n">✦</span>Kennzahlen</div></section>
  <div class="grid g-summary">
    <div class="card"><!-- Severity-Verteilung: sevbar (Segmente je Tier, Count) + Legende --></div>
    <div class="card"><!-- Findings nach Domäne: Code/Betrieb Balken --></div>
  </div>
  <div class="grid g-kpi"><!-- 4× .kpi: .top(dot+label) .val(Ink-Zahl) .cap .meter .src(Beleg) --></div>
  <div class="grid g-charts">
    <div class="card"><!-- Bus-Faktor: barrow × N (nm | track>fill(data) | wert) + Beleg --></div>
    <div class="card"><!-- Branch-Alter o.ä. --></div>
  </div>

  <section id="overview"><div class="sec-title"><span class="n">01</span>Überblick</div>
    <div class="card lede">…Landkarte… <div class="flow"><pre>…Datenfluss…</pre></div></div></section>

  <section id="findings"><div class="sec-title"><span class="n">02</span>Findings</div>
    <div class="tier-cap">BLOCKER · muss vor Release weg</div>
    <article class="finding f-crit"><div class="f-top"><span class="pill p-crit">Blocker</span></div>
      <h4>Titel</h4>
      <div class="beleg"><span class="bl">Beleg · datei:zeile</span><code>…wörtlich…</code></div>
      <p class="rat"><b>Warum</b> … <b>Vorschlag</b> …</p></article>
    <!-- Tiers weiter: f-ser/p-ser · f-warn/p-warn · f-nit/p-nit -->
  </section>

  <footer><p class="foot-top"><b>&lt;PROJEKT&gt; — Roast</b> · erzeugt mit roast-this</p>
    <div class="footnote"><b>gh-Fallback:</b> …falls zutreffend…</div></footer>
</div></body></html>
```
