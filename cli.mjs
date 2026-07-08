#!/usr/bin/env node
// skills — install Joachim's Claude Code skills into any repo.
//
//   skills init [dir]      copy every bundled skill into <dir>/.claude/skills
//   skills update [dir]    refresh the bundled skills (overwrite)
//   skills list            list the skills this package bundles
//   skills doctor          check prerequisites (node, bundled skills, claude CLI)
//
// Skills are AUTO-DISCOVERED from the package's skills/ directory: any folder
// with a SKILL.md is a skill. Adding a skill = adding a folder — no edit here.
// Pure Node ESM, no runtime dependencies.
import {
  cpSync, mkdirSync, existsSync, readFileSync, readdirSync, realpathSync,
} from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import process from "node:process";

export const PKG_ROOT = dirname(fileURLToPath(import.meta.url));
export const SKILLS_DIR = join(PKG_ROOT, "skills");
export const COMMANDS = ["init", "update", "list", "doctor"];

// ---------------------------------------------------------------------------
// Skill discovery
// ---------------------------------------------------------------------------

// Pull the `description:` line out of a SKILL.md YAML frontmatter. Best-effort,
// single-line only — used for `list` output, never for behaviour. Returns "".
export function parseDescription(skillMd) {
  const m = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "";
  const d = m[1].match(/^description:\s*(.+)$/m);
  return d ? d[1].trim() : "";
}

// Discover every skill under `root` (default: the package's skills/). A skill is
// any immediate subdirectory that contains a SKILL.md. Returns them sorted by
// name so output and copy order are deterministic.
export function discoverSkills(root = SKILLS_DIR) {
  if (!existsSync(root)) return [];
  const skills = [];
  for (const name of readdirSync(root)) {
    if (name.startsWith(".") || name.startsWith("_")) continue;
    const dir = join(root, name);
    const skillMd = join(dir, "SKILL.md");
    if (!existsSync(skillMd)) continue;
    skills.push({ name, dir, description: parseDescription(readFileSync(skillMd, "utf8")) });
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
export function parseArgs(argv) {
  const out = { command: undefined, positionals: [], only: undefined, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--only") out.only = splitList(argv[++i]);
    else if (a.startsWith("--only=")) out.only = splitList(a.slice("--only=".length));
    else if (a.startsWith("-")) out.positionals.push(a); // unknown flag → let caller decide
    else if (!out.command) out.command = a;
    else out.positionals.push(a);
  }
  return out;
}

function splitList(v) {
  return (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Core file operations
// ---------------------------------------------------------------------------

// Copy the bundled skills into <target>/.claude/skills/<name>.
//   overwrite=false → never clobber an existing skill (idempotent install)
//   overwrite=true  → refresh the bundled skill (update)
//   only=[names]    → restrict to these skills (undefined = all)
// Throws if `only` names a skill that isn't bundled — a silent skip would hide
// a typo and leave the user thinking they installed something they didn't.
export function copySkills(targetDir, { overwrite = false, only } = {}) {
  const all = discoverSkills();
  if (only) {
    const known = new Set(all.map((s) => s.name));
    const missing = only.filter((n) => !known.has(n));
    if (missing.length) {
      throw new Error(`Unknown skill(s): ${missing.join(", ")}. Available: ${all.map((s) => s.name).join(", ")}`);
    }
  }
  const selected = only ? all.filter((s) => only.includes(s.name)) : all;
  const results = [];
  for (const skill of selected) {
    const dest = join(targetDir, ".claude", "skills", skill.name);
    const existed = existsSync(dest);
    let action;
    if (existed && !overwrite) {
      action = "skipped";
    } else {
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(skill.dir, dest, { recursive: true, force: true });
      action = existed ? "updated" : "created";
    }
    results.push({ name: skill.name, action });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------
export function init(targetDir, { only } = {}) {
  const dir = resolve(targetDir);
  return { dir, skills: copySkills(dir, { overwrite: false, only }) };
}

export function update(targetDir, { only } = {}) {
  const dir = resolve(targetDir);
  return { dir, skills: copySkills(dir, { overwrite: true, only }) };
}

export function doctor() {
  const checks = [];
  const major = Number(process.versions.node.split(".")[0]);
  checks.push({ name: "node", ok: major >= 20, detail: `node ${process.versions.node} (need >=20)` });

  const skills = discoverSkills();
  checks.push({
    name: "skills",
    ok: skills.length > 0,
    detail: skills.length ? `${skills.length} skill(s) bundled: ${skills.map((s) => s.name).join(", ")}` : "no skills bundled",
  });

  // claude CLI present — the skills run inside Claude Code. Best-effort (never
  // throws); shell on Windows so a claude.cmd/claude.ps1 shim resolves on PATH.
  let claudeOk = false, claudeDetail = "claude CLI not found (install: https://claude.ai/code)";
  try {
    execFileSync("claude", ["--version"], { stdio: "ignore", shell: process.platform === "win32" });
    claudeOk = true; claudeDetail = "claude CLI found";
  } catch { /* not installed — ok stays false */ }
  checks.push({ name: "claude", ok: claudeOk, detail: claudeDetail });

  return { ok: checks.every((c) => c.ok), checks };
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------
const USAGE = `skills <command> [options]

Commands:
  init [dir]     Copy every bundled skill into <dir>/.claude/skills
                 (default dir: current directory). Never clobbers an existing skill.
  update [dir]   Refresh the bundled skills, overwriting the installed copies.
  list           List the skills this package bundles.
  doctor         Check prerequisites (node >=20, bundled skills, claude CLI).

Options:
  --only <a,b>   Restrict init/update to the named skill(s).
  -h, --help     Show this help.`;

function summarise(res) {
  return ["Skills:", ...res.skills.map((r) => `  ${r.action.padEnd(8)} ${r.name}`)].join("\n");
}

export async function main(argv) {
  const opts = parseArgs(argv);
  if (opts.help || !opts.command) { console.log(USAGE); return 0; }
  if (!COMMANDS.includes(opts.command)) {
    console.error(`Unknown command: ${opts.command}\n\n${USAGE}`);
    return 1;
  }
  const targetDir = opts.positionals[0] ?? process.cwd();
  try {
    switch (opts.command) {
      case "init": {
        const res = init(targetDir, { only: opts.only });
        console.log(`Installed skills into ${res.dir}`);
        console.log(summarise(res));
        return 0;
      }
      case "update": {
        const res = update(targetDir, { only: opts.only });
        console.log(`Updated skills in ${res.dir}`);
        console.log(summarise(res));
        return 0;
      }
      case "list": {
        const skills = discoverSkills();
        if (!skills.length) { console.log("No skills bundled."); return 0; }
        for (const s of skills) console.log(`${s.name}\n  ${s.description || "(no description)"}`);
        return 0;
      }
      case "doctor": {
        const rep = doctor();
        for (const c of rep.checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name}: ${c.detail}`);
        return rep.ok ? 0 : 1;
      }
      default:
        console.error(`Unknown command: ${opts.command}`);
        return 1;
    }
  } catch (e) {
    console.error(`skills ${opts.command} failed: ${e.message}`);
    return 1;
  }
}

// Run only when invoked directly (not when imported by tests). Resolve argv[1]
// through realpath first: when installed via npx / `npm i -g`, the `skills` bin
// is a SYMLINK, so process.argv[1] is the link path while import.meta.url is the
// resolved target — comparing them raw makes the CLI a silent no-op on Linux/macOS.
export function isDirectRun(argv1, moduleUrl) {
  if (!argv1) return false;
  let real = argv1;
  try { real = realpathSync(argv1); } catch { /* not a real path — compare as-is */ }
  return moduleUrl === pathToFileURL(real).href;
}

if (isDirectRun(process.argv[1], import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
