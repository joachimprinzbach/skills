# Report-Template — die HTML-Seite für `roast-this`

Reine **Darstellung**, keine Prüf-Logik. Dieses Skelett ist der Ausgangspunkt; passe Inhalt und Abschnitte an den konkreten Review an (bei einem kleinen Repo weniger, bei einer Plattform mehr).

## Rendering-Regeln

- **Self-contained.** Alles inline: CSS im `<style>`, keine externen Fonts/Skripte/Bilder. Diagramme als ASCII in `<pre>` oder inline-SVG.
- **Dark + Gold**, im Idiom der bestehenden Orpheus-Seiten (`orpheus-overview.html`, `orpheus-quality-roadmap.html`) — damit die Outputs eine Familie sind. Palette unten.
- **Responsive.** Relative Einheiten, `max-width`, breite Blöcke (Tabellen, Diagramme) in einen `overflow-x: auto`-Container; der Body scrollt nie horizontal.
- **Default-Ausgabe:** lokale `.html`-Datei im Arbeitsverzeichnis (z. B. `<projekt>-roast.html`). Will der Nutzer teilen → anbieten, sie als Artifact zu publizieren.
- **Cross-Link** zu einer bestehenden Overview-Seite, falls vorhanden (wie sich die Orpheus-Seiten gegenseitig verlinken).

## Harte Beleg-Regel (nicht verhandelbar)

**Jede Scorecard-Kachel und jeder Tier-Eintrag trägt seinen Beleg** — `datei:zeile` (Code) oder gh-/git-Ausgabe (Betrieb). Ein Eintrag ohne Fundstelle **existiert nicht** und darf nicht gerendert werden. Verboten sind weiche Claims wie „besser als gedacht" oder „~250 Testklassen" ohne Quelle. Zahlen in der Scorecard müssen aus einer nachvollziehbaren Zählung/Ausgabe stammen. Das ist der Unterschied zwischen einem geerdeten Report und einer schön aussehenden Halluzination.

## Abschnitte (in dieser Reihenfolge)

1. **Header + Verdikt** — 1–2 ehrliche Sätze mit Persönlichkeit. Wo etwas dringend dran ist, unmissverständlich.
2. **Overview / Landkarte** (das Intro) — was ist das System, welche Repos/Rollen, Datenfluss (Diagramm bei Plattform), Tech-Stack. Bei kleinem Repo: ein Absatz.
3. **Scorecard** — die Kern-Signale auf einen Blick, jede Kachel mit Beleg und Ampel (rot/orange/grün).
4. **Priorisierte Tiers** — Blocker → Sollte → Zur Überlegung → Nit, über **beide** Domänen vereint. Jeder Fund: **Was** (Beleg) → **Warum** (Prinzip/Domäne) → **Vorschlag**. Ein urteilender Tier trägt max. ~5 flache Einträge (Signal-Deckel, siehe SKILL.md §4) — verwandte Funde als *ein* Thema mit einem Titel bündeln, die Fundstellen darunter.
5. **Was gut ist** — ehrlich, konkret.
6. **Footer** — Stand, Scope, gh-Fallback-Hinweis falls zutreffend („Betriebs-Signale aus lokalem git; Branch-Protection ohne gh nicht geprüft").

## Palette (aus den bestehenden Seiten)

```
--bg:#0d1117  --bg-card:#1c2333  --border:#2d3748
--text:#e6edf3  --text-dim:#9aa7b5
--accent:#d4a017 (gold)  --accent-soft:#f0c75e
--blue:#58a6ff  --green:#3fb950  --red:#f85149  --orange:#db8a2a  --purple:#bc8cff
--mono:'SF Mono','Cascadia Code','Consolas',monospace
--sans:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif
```

Severity → Farbe: Blocker `--red`, Sollte `--orange`, Zur Überlegung `--blue`, Nit `--text-dim`. Was-gut `--green`.

## Skelett (anpassen, nicht sklavisch kopieren)

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><PROJEKT> — Roast</title>
<style>
  :root{
    --bg:#0d1117;--bg-card:#1c2333;--border:#2d3748;
    --text:#e6edf3;--text-dim:#9aa7b5;--accent:#d4a017;--accent-soft:#f0c75e;
    --blue:#58a6ff;--green:#3fb950;--red:#f85149;--orange:#db8a2a;
    --mono:'SF Mono','Cascadia Code','Consolas',monospace;
    --sans:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--sans);background:var(--bg);color:var(--text);line-height:1.6;font-size:15px}
  .wrap{max-width:1180px;margin:0 auto;padding:0 24px}
  header{background:radial-gradient(ellipse at top,#241d10 0%,var(--bg) 70%);border-bottom:1px solid var(--border);padding:52px 0 34px;text-align:center}
  header h1{font-size:36px;font-weight:700;background:linear-gradient(90deg,var(--accent-soft),var(--accent));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
  .verdikt{max-width:820px;margin:16px auto 0;color:var(--text-dim);font-size:16px}
  nav{position:sticky;top:0;z-index:50;background:rgba(13,17,23,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}
  nav .wrap{display:flex;gap:4px;flex-wrap:wrap;padding-block:8px}
  nav a{color:var(--text-dim);text-decoration:none;font-size:13.5px;padding:6px 12px;border-radius:6px}
  nav a:hover{color:var(--text);background:var(--bg-card)}
  section{padding:40px 0 8px}
  h2{font-size:25px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:12px}
  .lead{background:var(--bg-card);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:10px;padding:22px 26px}
  .score-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
  .score{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:16px 18px}
  .score .big{font-size:30px;font-weight:700}
  .score .lbl{font-size:13px;color:var(--text-dim);margin-top:4px}
  .c-red{color:var(--red)}.c-orange{color:var(--orange)}.c-green{color:var(--green)}.c-blue{color:var(--blue)}
  .tier{margin-bottom:22px}
  .tier-badge{font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px}
  .tb-blocker{background:var(--red);color:#fff}.tb-sollte{background:var(--orange);color:#1a1205}
  .tb-ueberlegung{background:var(--blue);color:#06121f}.tb-nit{background:var(--border);color:var(--text)}
  .find{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:16px 18px;margin-top:12px}
  .find h4{font-size:15px;margin-bottom:6px}
  .find .loc{font-family:var(--mono);font-size:12.5px;color:var(--blue)}
  .find .quote{font-family:var(--mono);font-size:12.5px;background:#0a0e14;border:1px solid var(--border);border-radius:6px;padding:8px 10px;margin:8px 0;color:var(--accent-soft);overflow-x:auto}
  .find .why{font-size:13.5px;color:var(--text-dim)}
  .diagram{background:#0a0e14;border:1px solid var(--border);border-radius:10px;padding:22px;overflow-x:auto}
  .diagram pre{font-family:var(--mono);font-size:12.5px;line-height:1.55;white-space:pre;min-width:640px}
  code{font-family:var(--mono);font-size:12.5px;background:#0a0e14;padding:1px 6px;border-radius:4px;color:var(--accent-soft);border:1px solid var(--border)}
  footer{margin-top:44px;border-top:1px solid var(--border);padding:22px 0 40px;text-align:center;color:var(--text-dim);font-size:13px}
</style>
</head>
<body>
  <header><div class="wrap">
    <h1><PROJEKT></h1>
    <p class="verdikt"><!-- 1–2 ehrliche Sätze: gut genug für den Zweck? roter Faden? dringendes unmissverständlich --></p>
  </div></header>
  <nav><div class="wrap">
    <a href="#overview">Überblick</a><a href="#score">Status</a>
    <a href="#findings">Findings</a><a href="#gut">Was gut ist</a>
  </div></nav>
  <main class="wrap">
    <section id="overview"><h2>🧭 Überblick</h2>
      <div class="lead"><!-- Landkarte: Repos/Rollen, Tech-Stack --></div>
      <!-- bei Plattform: <div class="diagram"><pre>...Datenfluss...</pre></div> -->
    </section>
    <section id="score"><h2>📊 Status-Check</h2>
      <div class="score-grid">
        <!-- pro Kachel: Zahl/Ampel + Label MIT Beleg. Keine Kachel ohne Fundstelle. -->
        <div class="score"><div class="big c-red">N</div><div class="lbl">... <code>beleg</code></div></div>
      </div>
    </section>
    <section id="findings"><h2>🗂️ Findings</h2>
      <div class="tier">
        <span class="tier-badge tb-blocker">BLOCKER</span>
        <div class="find">
          <h4>Kurztitel</h4>
          <div class="loc">datei:zeile  ·  oder gh-/git-Beleg</div>
          <div class="quote">…wörtliches Zitat / Ausgabe…</div>
          <p class="why"><b>Warum:</b> Prinzip (Domäne). <b>Vorschlag:</b> konkret.</p>
        </div>
      </div>
      <!-- weitere Tiers: tb-sollte / tb-ueberlegung / tb-nit -->
    </section>
    <section id="gut"><h2>✅ Was gut ist</h2>
      <div class="lead"><!-- 2–3 konkrete, belegte Punkte --></div>
    </section>
  </main>
  <footer><div class="wrap">
    <p><b><PROJEKT> — Roast</b> · Code + Betrieb vereint</p>
    <p>Stand: <DATUM> · Scope: <N Repos / Modul> · <gh-Fallback-Hinweis falls zutreffend></p>
  </div></footer>
</body>
</html>
```
