# Report-Template — die HTML-Seite für `roast-this`

Reine **Darstellung**, keine Prüf-Logik. Dieses Skelett ist der Ausgangspunkt; passe Inhalt und Abschnitte an den konkreten Review an (kleines Repo → weniger, Plattform → mehr).

## Design-Haltung: editoriales Audit, nicht Terminal-Dump

Das Deliverable liest ein Mensch — oft ein Stakeholder, nicht nur ein Entwickler. Es sieht aus wie ein **hochwertiger Consulting-/Magazin-Report**, nicht wie ein Terminal:

- **Hell und warm** (Werkdruckpapier-Ton), **nicht dark**, **nicht techy**. Ember/Toast-Akzente passen semantisch zum *Roast*.
- **Magazin-Typografie:** eine charaktervolle Display-Serif (Fraunces) für Überschriften/Verdikt, eine ruhige Lese-Serif (Newsreader) für den Fließtext. Monospace **nur** für Code-Belege — dezent, auf getöntem Inset, nie als schwarzes Terminalfenster.
- **Großzügige Ränder, klare Hierarchie, ruhige Motion** (ein gestaffelter Fade-in beim Laden, `prefers-reduced-motion` respektiert).
- Severity über **farbige Spines + Small-Caps-Labels**, nicht über laute Neon-Badges.

## Rendering-Regeln

- **Fonts via Google-Fonts-`<link>`** (Fraunces, Newsreader, IBM Plex Mono) mit robustem System-Fallback im Stack (`'Iowan Old Style','Palatino Linotype',Georgia,serif`). Der Fallback trägt das Design auch offline. **Hinweis:** Bei Artifact-Publishing greift wegen CSP der Fallback — für die volle Wirkung als lokale `.html` ausgeben.
- **Ansonsten self-contained:** CSS inline, keine externen Skripte/Bilder; Diagramme als ASCII in `<pre>` oder inline-SVG; Grain/Textur als data-URI-SVG.
- **Responsive:** Lese-Spalte ~760px, Seitenrahmen ~940px; breite Blöcke (Diagramme, Belege) in `overflow-x:auto`; Body scrollt nie horizontal.
- **Default-Ausgabe:** lokale `.html`-Datei im Arbeitsverzeichnis (z. B. `<projekt>-roast.html`). Zum Teilen anbieten, sie als Artifact zu publizieren (mit dem Font-Caveat oben).

## Harte Beleg-Regel (nicht verhandelbar)

**Jede Kennzahl und jeder Fund trägt seinen Beleg** — `datei:zeile` (Code) oder gh-/git-Ausgabe (Betrieb) — sichtbar im `.beleg`-Inset bzw. `.src` der Kachel. Ohne Fundstelle **existiert der Eintrag nicht**. Verboten sind weiche Claims („besser als gedacht", „~250 Testklassen") ohne Quelle. Das trennt einen geerdeten Report von einer schön aussehenden Halluzination.

## Signal-Deckel (spiegelt SKILL.md §4)

Ein urteilender Tier trägt **max. ~5 flache Einträge**. Mehr → verwandte Funde als *ein* Thema mit einem Titel bündeln (die Fundstellen darunter im Beleg), Schwächstes nach unten. Neun gleichgewichtige Einträge sind kein Signal, nur eine Liste.

## Abschnitte (in dieser Reihenfolge)

1. **Header** — Eyebrow, Subject (Repo/Modul), ein **Verdikt als Headline** (kurze, ehrliche These in der Display-Serif) + Verdikt-Lead-Absatz, Meta-Zeile (Stand · Scope · Kalibrierung).
2. **Überblick / Landkarte** — was ist das System, Repos/Rollen, Datenfluss (ASCII-Diagramm bei Plattform), Stack. Bei kleinem Repo: ein Absatz.
3. **Status auf einen Blick** — Kennzahl-Kacheln, jede mit Ampel-Dot (rot/ochre/sage) und Beleg (`.src`).
4. **Findings** — Tiers Blocker → Sollte → Zur Überlegung → Nit, über **beide** Domänen vereint. Pro Fund: farbiger Spine, Titel, `.beleg`-Inset, dann **Warum → Vorschlag** als Fließtext mit Small-Caps-Run-in-Labels.
5. **Was gut ist** — sage-Akzent, ehrlich, konkret, mit Fundstelle.
6. **Footer** — Meta + gh-Fallback-Fußnote, falls zutreffend.

## Palette

```
--paper:#FAF6EE  --paper-card:#FFFDF8  --paper-inset:#F3ECDD
--ink:#221F19    --ink-soft:#6E6658    --line:#E5DCCB
--ember:#BF461C  --ember-deep:#9A3714  --ember-tint:#F5E4D6
Severity → --blocker:#B23A1E  --sollte:#B07A1C  --ueberlegung:#3E6B78  --nit:#8C8475  --gut:#5C7A4E
--serif:'Fraunces',…  --body:'Newsreader',…  --mono:'IBM Plex Mono',…
```

## Skelett (anpassen, nicht sklavisch kopieren)

Der vollständige, produktionsreife Aufbau samt CSS ist in der gerenderten Beispiel-Datei dokumentiert (ein `roast-this`-Lauf erzeugt sie). Kernstruktur:

```html
<!DOCTYPE html><html lang="de"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>&lt;PROJEKT&gt; — Roast</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=Newsreader:opsz,wght@6..72,400;6..72,500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{ /* Palette oben */
    --serif:'Fraunces','Iowan Old Style','Palatino Linotype',Georgia,serif;
    --body:'Newsreader','Iowan Old Style',Georgia,serif;
    --mono:'IBM Plex Mono',Consolas,monospace; }
  body{font-family:var(--body);background:var(--paper);color:var(--ink);font-size:18px;line-height:1.62}
  /* warmer Grain via body::before mit data-URI-feTurbulence; Ember-Radial im header::after */
  .wrap{max-width:940px;margin:0 auto;padding:0 32px} .col{max-width:760px}
  h1{font-family:var(--serif);font-weight:900;font-size:clamp(38px,6vw,68px);line-height:1.02}
  h1 em{font-style:italic;color:var(--ember)}
  h2{font-family:var(--serif);font-weight:600;font-size:30px}
  .eyebrow{font-family:var(--mono);letter-spacing:.28em;text-transform:uppercase;color:var(--ember)}
  /* .finding: grid 4px+1fr, farbiger .spine je Severity, .f-in Padding */
  /* .beleg: getöntes Inset, border-left ember, .bl Small-Caps-Label, code mono */
  /* .rationale b: Small-Caps-Run-in (Warum/Vorschlag) */
  /* .stats: Kachel-Grid mit .dot Ampel + .src Beleg */
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .rise{animation:rise .7s cubic-bezier(.2,.7,.2,1) both}
  @media(prefers-reduced-motion:reduce){.rise{animation:none}}
</style></head><body>
  <header><div class="wrap col">
    <div class="eyebrow rise">Roast — Code &amp; Betrieb, eine Stimme</div>
    <div class="subject rise">&lt;PROJEKT&gt;</div>
    <h1 class="rise">&lt;Verdikt-These&gt; — <em>&lt;die Pointe.&gt;</em></h1>
    <p class="lead rise">&lt;Verdikt-Absatz: gut genug für den Zweck? roter Faden? Dringendes unmissverständlich.&gt;</p>
    <div class="metabar rise"><span>Stand · <b>…</b></span><span>Scope · <b>…</b></span><span>Kalibrierung · <b>…</b></span></div>
  </div></header>
  <nav><div class="wrap"><a href="#overview">Überblick</a><a href="#status">Status</a><a href="#findings">Findings</a><a href="#gut">Was gut ist</a></div></nav>
  <main class="wrap">
    <section id="overview"><div class="col"><div class="sec-head"><span class="sec-num">01</span><h2>Überblick</h2></div></div>
      <div class="lede-card">…Landkarte… <div class="flow"><pre>…Datenfluss…</pre></div></div></section>
    <section id="status"><div class="col"><div class="sec-head"><span class="sec-num">02</span><h2>Status auf einen Blick</h2></div></div>
      <div class="stats"><div class="stat"><span class="dot bad"></span><div class="num bad">N</div><div class="k">…</div><div class="src">beleg</div></div></div></section>
    <section id="findings"><div class="col"><div class="sec-head"><span class="sec-num">03</span><h2>Findings</h2></div></div>
      <div class="col">
        <div class="tier-label tl-blocker"><span class="sq"></span>Blocker</div>
        <article class="finding f-blocker"><div class="spine"></div><div class="f-in">
          <h4>Titel</h4>
          <div class="beleg"><span class="bl">Beleg · datei:zeile</span><code>…wörtlich…</code></div>
          <p class="rationale"><b>Warum</b> … <b>Vorschlag</b> …</p>
        </div></article>
        <!-- weitere Tiers: tl-/f- sollte · ueberlegung · nit -->
      </div></section>
    <section id="gut"><div class="col"><div class="sec-head"><span class="sec-num">04</span><h2>Was gut ist</h2></div></div>
      <div class="gut-grid"><div class="gut"><h4>…</h4><p>…</p><div class="loc">datei:zeile</div></div></div></section>
  </main>
  <footer><div class="wrap col"><p class="foot-top"><b>&lt;PROJEKT&gt; — Roast</b> · erzeugt mit <b>roast-this</b></p>
    <div class="footnote"><b>gh-Fallback:</b> …falls zutreffend…</div></div></footer>
</body></html>
```
