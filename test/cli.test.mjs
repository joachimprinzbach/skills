import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseArgs, parseDescription, discoverSkills, copySkills, init, update, doctor, COMMANDS,
} from "../cli.mjs";

function tmp() {
  return mkdtempSync(join(tmpdir(), "skills-test-"));
}

test("parseArgs: command + dir positional", () => {
  const o = parseArgs(["init", "some/dir"]);
  assert.equal(o.command, "init");
  assert.deepEqual(o.positionals, ["some/dir"]);
  assert.equal(o.only, undefined);
});

test("parseArgs: --only accepts comma list and repeated space form", () => {
  assert.deepEqual(parseArgs(["init", "--only", "a,b"]).only, ["a", "b"]);
  assert.deepEqual(parseArgs(["init", "--only=a, b ,c"]).only, ["a", "b", "c"]);
});

test("parseArgs: -h sets help", () => {
  assert.equal(parseArgs(["-h"]).help, true);
});

test("parseDescription: reads description from frontmatter", () => {
  const md = "---\nname: x\ndescription: Hello world\n---\n\n# Body\n";
  assert.equal(parseDescription(md), "Hello world");
});

test("parseDescription: returns '' when no frontmatter", () => {
  assert.equal(parseDescription("# Just a body"), "");
});

test("discoverSkills: finds the bundled roast-me-joachim skill", () => {
  const names = discoverSkills().map((s) => s.name);
  assert.ok(names.includes("roast-me-joachim"), `expected roast-me-joachim in ${names.join(", ")}`);
});

test("discoverSkills: ignores dirs without a SKILL.md and _-prefixed dirs", () => {
  const root = tmp();
  try {
    mkdirSync(join(root, "real"));
    writeFileSync(join(root, "real", "SKILL.md"), "---\nname: real\n---\n");
    mkdirSync(join(root, "empty")); // no SKILL.md
    mkdirSync(join(root, "_lib"));
    writeFileSync(join(root, "_lib", "SKILL.md"), "---\nname: lib\n---\n");
    const names = discoverSkills(root).map((s) => s.name);
    assert.deepEqual(names, ["real"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("init: creates skills, then is idempotent (skips on second run)", () => {
  const root = tmp();
  try {
    const first = init(root);
    const roast = first.skills.find((s) => s.name === "roast-me-joachim");
    assert.equal(roast.action, "created");
    assert.ok(existsSync(join(root, ".claude", "skills", "roast-me-joachim", "SKILL.md")));
    // references travel with the skill directory
    assert.ok(existsSync(join(root, ".claude", "skills", "roast-me-joachim", "references")));

    const second = init(root);
    assert.equal(second.skills.find((s) => s.name === "roast-me-joachim").action, "skipped");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("update: overwrites an existing skill", () => {
  const root = tmp();
  try {
    init(root);
    const res = update(root);
    assert.equal(res.skills.find((s) => s.name === "roast-me-joachim").action, "updated");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("copySkills: --only unknown skill throws (no silent skip)", () => {
  const root = tmp();
  try {
    assert.throws(() => copySkills(root, { only: ["does-not-exist"] }), /Unknown skill/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("copySkills: --only restricts to the named skill", () => {
  const root = tmp();
  try {
    const res = copySkills(root, { only: ["roast-me-joachim"] });
    assert.deepEqual(res.map((r) => r.name), ["roast-me-joachim"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("doctor: reports skills present and node ok", () => {
  const rep = doctor();
  assert.equal(rep.checks.find((c) => c.name === "skills").ok, true);
  assert.equal(rep.checks.find((c) => c.name === "node").ok, true);
});

test("COMMANDS is the documented set", () => {
  assert.deepEqual(COMMANDS, ["init", "update", "list", "doctor"]);
});
