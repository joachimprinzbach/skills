// Stamp the release version into the Claude Code plugin manifest.
// Called by semantic-release (@semantic-release/exec prepareCmd) as:
//   node scripts/stamp-version.mjs <version>
// so the plugin.json version tracks the npm/git release in lockstep. The change
// is committed back by @semantic-release/git.
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!version) {
  console.error("stamp-version: missing <version> argument");
  process.exit(1);
}

const file = new URL("../.claude-plugin/plugin.json", import.meta.url);
const manifest = JSON.parse(readFileSync(file, "utf8"));
manifest.version = version;
writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Stamped plugin.json version -> ${version}`);
