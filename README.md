# skills

Joachim Prinzbach's [Claude Code](https://claude.ai/code) skills — reusable engineering
disciplines. Install the whole set as a **plugin**, or copy any subset into a repo with the
**npx CLI**. Skills are auto-discovered from [`skills/`](./skills): a folder with a `SKILL.md`
is a skill.

## Skills

| Skill | What it does |
|---|---|
| [`grill-me-joachim`](./skills/grill-me-joachim/SKILL.md) | An honest, craft-driven code/design review in Joachim's voice — Ousterhout design + architecture/domain modelling, Clean Code, engineering craft (interfaces, testing, docs, DevOps, VCS hygiene), Angular frontends and maintainability/knowledge-risk signals (bus factor, recorded decisions). Fans out one grounded finder per lens, then synthesises calibrated, prioritised findings — with a bit of humour. |
| [`check-my-machine`](./skills/check-my-machine/SKILL.md) | Checks whether the machine is ready for agentic coding — git, gh, node/npm, Claude CLI and Python/uv installed, up to date (against latest) and sensibly configured. Cross-platform, diagnose-only, with copy-paste fixes per OS. |

## Install as a Claude Code plugin

```
/plugin marketplace add joachimprinzbach/skills
/plugin install jp-skills@jp-skills
```

The whole skill set is then available in Claude Code; invoke one with `/grill-me-joachim`.

## Install into a repo with the CLI

Copies the skills into `<repo>/.claude/skills/` so they live with that project.

```bash
npx @joachimprinzbach/skills init            # install every skill into the current repo
npx @joachimprinzbach/skills init ../myrepo  # ...or into another directory
npx @joachimprinzbach/skills init --only grill-me-joachim
npx @joachimprinzbach/skills update          # refresh installed skills (overwrite)
npx @joachimprinzbach/skills list            # list available skills
npx @joachimprinzbach/skills doctor          # check node, bundled skills, claude CLI
```

`init` never clobbers an existing skill; `update` overwrites the bundled ones.

> The package publishes to **GitHub Packages** under the `@joachimprinzbach` scope. To install
> from there, point npm at the registry for that scope:
> ```
> npm config set @joachimprinzbach:registry https://npm.pkg.github.com
> ```
> and authenticate with a GitHub token that has `read:packages`.

## Adding a skill

1. Create `skills/<your-skill>/SKILL.md` (with `name:` + `description:` frontmatter).
2. Add any progressive-disclosure material under `skills/<your-skill>/references/`.

That's it — the CLI, `list`, `doctor`, and the plugin all pick it up automatically. No code to edit.

## Development

```bash
node --test "test/**/*.test.mjs"   # run the dependency-free CLI suite
```

Releases are automated: [Conventional Commits](https://www.conventionalcommits.org/) on `main`
drive [semantic-release](https://semantic-release.gitbook.io/), which bumps the version, stamps
`.claude-plugin/plugin.json`, tags, and publishes to GitHub Packages.
