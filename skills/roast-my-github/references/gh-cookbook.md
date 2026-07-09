# gh-Cookbook — read-only Gather-Rezepte & Schwellen

Alle Befehle hier sind **read-only**. Nichts in dieser Datei mutiert das Repo. `gh api` ersetzt die Platzhalter `{owner}`, `{repo}` und `{branch}` automatisch aus dem aktuellen Repository. Fehlt `gh` oder die Auth (`gh auth status`), brich ab und verweise auf `check-my-machine`.

Nicht jedes Signal ist ohne Weiteres zugänglich: Branch-Protection- und Collaborator-Endpunkte brauchen Push-/Admin-Rechte und geben sonst `403`/`404`. Ein `404` auf einem Protection-Endpunkt bedeutet meist **"dieser Branch ist nicht geschützt"** — das ist dann selbst der Fund, keine Fehlermeldung zum Verstecken. Wo ein Signal wirklich nicht zugänglich ist, sag das transparent, statt es zu erfinden.

## Scope & Setup

```bash
gh auth status
gh repo view --json name,owner,defaultBranchRef,isPrivate,visibility,\
mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed,deleteBranchOnMerge,\
hasIssuesEnabled,isArchived,createdAt,pushedAt,licenseInfo
```

Daraus fällt schon viel: Default-Branch, erlaubte Merge-Strategien, ob Branches nach dem Merge gelöscht werden, ob Issues überhaupt an sind, Alter & letzter Push (Regler-Signal für "lebt das Repo noch?").

## (a) Governance & Branch-Schutz

```bash
# Branch Protection des Default-Branch (Admin-Recht nötig; 404 = ungeschützt = Fund)
gh api repos/{owner}/{repo}/branches/{branch}/protection

# Neuere Rulesets (falls statt klassischer Protection genutzt)
gh api repos/{owner}/{repo}/rulesets

# CODEOWNERS vorhanden? (404 = keins) — an allen drei erlaubten Orten prüfen
gh api repos/{owner}/{repo}/contents/.github/CODEOWNERS
gh api repos/{owner}/{repo}/contents/CODEOWNERS
gh api repos/{owner}/{repo}/contents/docs/CODEOWNERS

# Wer hat direkten Schreibzugriff (Push-Recht nötig zum Auslesen)
gh api repos/{owner}/{repo}/collaborators --jq '.[] | {login:.login, perm:.permissions}'
```

Aus dem Protection-JSON zählen v. a.: `required_pull_request_reviews` (existiert es? `required_approving_review_count`?), `required_status_checks` (welche, `strict`?), `enforce_admins`, `allow_force_pushes`, `restrictions` (wer darf pushen). **Kernfrage: Kann ungeprüfter Code auf den Default-Branch?**

## (b) PR-Kultur & Delivery-Flow

```bash
# Offene PRs: Größe, Draft-Status, Alter, Review-Stand
gh pr list --state open --limit 100 --json number,title,additions,deletions,\
changedFiles,isDraft,createdAt,reviewDecision,reviews,author

# Zuletzt gemergte PRs: Größe, ob überhaupt reviewt, CI-Stand
gh pr list --state merged --limit 50 --json number,title,additions,deletions,\
changedFiles,reviews,reviewDecision,createdAt,mergedAt,statusCheckRollup,author

# Review-Latenz eines einzelnen PR (createdAt vs. reviews[].submittedAt)
gh pr view <n> --json number,createdAt,reviews

# CI-Grün-Rate der letzten Läufe
gh run list --limit 50 --json conclusion,headBranch,name
```

Für tote/langlebige Branches ist lokales git zuverlässiger als die API (die Branch-Liste allein trägt kein Commit-Datum):

```bash
git for-each-ref --sort=committerdate refs/remotes/origin \
  --format='%(committerdate:short)  %(refname:short)'
```

**Kernfrage: Fließt Arbeit geprüft durch, oder wird durchgewunken?** Achte auf gemergte PRs mit `reviews: []` bzw. `reviewDecision` leer, auf chronisch große Diffs und auf einen Wald alter `origin/*`-Branches.

## (c) Issue- & Wissens-Hygiene

```bash
# Offene Issues: Labels, Alter, ob jemandem zugeordnet
gh issue list --state open --limit 100 --json number,title,labels,createdAt,updatedAt,assignees

# Label-Schema überhaupt vorhanden?
gh label list

# Issue- & PR-Templates (404 = keins)
gh api repos/{owner}/{repo}/contents/.github/ISSUE_TEMPLATE
gh api repos/{owner}/{repo}/contents/.github/pull_request_template.md

# Releases / Changelog-Kadenz
gh release list --limit 20
gh api repos/{owner}/{repo}/contents/CHANGELOG.md

# Contributor-Verteilung — Bus-Faktor als REPO-Signal, keine Personen-Benotung
gh api repos/{owner}/{repo}/contributors --jq '.[] | {login:.login, commits:.contributions}'
```

**Kernfrage: Bleibt Wissen im Repo hängen, oder nur in Köpfen?** Beschreibungslose PRs/Issues, ein alt gewordener Backlog ohne Triage, kein Changelog, und ein Contributor, auf den fast alle Commits entfallen, sind Wissensrisiken am *Artefakt* — nie am Menschen.

## Interpretations-Schwellen (Defaults — Heuristiken, über den Regler kalibrieren)

Das sind Startwerte, keine Naturgesetze. Auf einem Solo-Prototyp lockerer, auf einer geteilten Plattform strenger. Nenn im Finding immer den gemessenen Wert, nicht nur "über der Schwelle".

| Signal | Default-Schwelle | Lens |
|---|---|---|
| PR "groß" | > 400 geänderte Zeilen (add+del) **oder** > 20 geänderte Dateien | b |
| PR "durchgewunken" | gemerged mit `reviews: []` in einem Team-Repo | b |
| Review-Latenz "zäh" | Median Zeit bis erstes Review > 24 h (Arbeitskontext) | b |
| Branch "tot" | kein Commit seit > 30 Tagen, kein offener PR, nicht der Default | b |
| Draft-Leiche | Draft-PR seit > 30 Tagen ohne Aktivität | b |
| CI-Grün-Rate "niedrig" | < 80 % grün auf dem Default-Branch | b |
| Issue "abgestanden" | offen & seit > 90 Tagen kein Update | c |
| Bus-Faktor-Risiko | ein Contributor > 80 % der Commits (in einem Team-Repo) | c |

## Fix-Beispiele (der Mensch führt aus — du gibst nur den Befehl)

```bash
# Required Reviews + Statuscheck auf main verlangen (Admin nötig)
gh api -X PUT repos/{owner}/{repo}/branches/main/protection \
  -f 'required_pull_request_reviews[required_approving_review_count]=1' \
  -F 'enforce_admins=true' -F 'restrictions=null' \
  -F 'required_status_checks[strict]=true'

# Branches nach dem Merge automatisch löschen
gh repo edit --delete-branch-on-merge

# Merge-Commits abschalten, nur Squash erlauben
gh repo edit --enable-merge-commit=false --enable-squash-merge=true
```

Diese Befehle **schreiben** — sie gehören in die Ausgabe als Empfehlung, du führst sie **nicht** selbst aus.
