// Sync src/CometChat/ from the UI Kit's sample app.
//
// This folder carries no local edits, so the sync needs no merge strategy. The settings seam
// (SettingsProvider / useSettings / useFeatureProps) means every builder-specific file is a
// sibling OUTSIDE CometChat/, and the import direction is one-way: builder files import the
// sample app, never the reverse.
//
// So the sync is a mirror, not a merge: copy the tree, delete what upstream removed, and report.
// The invariant is "never diverges", which is why scripts/guard-cometchat.mjs fails any PR that
// hand-edits this folder — a divergence here is a bug, not an outcome to reconcile.
//
// The excluded files are the ones each consumer OWNS (its shell and credentials) plus the
// sample app's own tests. See .cometchat-sync/manifest.json.

import { createHash } from 'node:crypto';
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, rmSync,
  readdirSync, statSync, copyFileSync,
} from 'node:fs';
import { join, relative, dirname } from 'node:path';

const sourceRoot = process.argv[2]; // e.g. _uikit/sample-app/src
if (!sourceRoot) {
  console.error('usage: node scripts/sync-cometchat.mjs <path-to-sample-app-src>');
  process.exit(2);
}

const manifest = JSON.parse(readFileSync('.cometchat-sync/manifest.json', 'utf8'));
const DEST = manifest.destination;              // 'src/CometChat'
const EXCLUDE = new Set(manifest.exclude);      // paths relative to sample-app/src

if (!existsSync(sourceRoot)) {
  console.error(`source not found: ${sourceRoot}`);
  process.exit(2);
}

const hash = (p) => createHash('sha1').update(readFileSync(p)).digest('hex');
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const added = [], updated = [], removed = [], excluded = [], unchanged = [];

// --- copy in, tracking what changed -----------------------------------------------------------
const wanted = new Set();
for (const src of walk(sourceRoot)) {
  const rel = relative(sourceRoot, src);
  if (EXCLUDE.has(rel)) { excluded.push(rel); continue; }

  wanted.add(rel);
  const dest = join(DEST, rel);

  if (!existsSync(dest)) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    added.push(rel);
  } else if (hash(src) !== hash(dest)) {
    copyFileSync(src, dest);
    updated.push(rel);
  } else {
    unchanged.push(rel);
  }
}

// --- delete what upstream removed --------------------------------------------------------------
// A mirror has to prune, or a file deleted upstream lives on here forever and quietly diverges.
if (existsSync(DEST)) {
  for (const dest of walk(DEST)) {
    const rel = relative(DEST, dest);
    if (!wanted.has(rel)) { rmSync(dest); removed.push(rel); }
  }
}

// --- report -------------------------------------------------------------------------------------
const list = (a) => (a.length ? a.map((f) => `- \`${f}\``).join('\n') : '_none_');
const version = process.env.UIKIT_VERSION || '';
const ref = process.env.SYNC_REF || 'unknown';

const report = `# sample app → \`${DEST}\`

Source: \`cometchat-team/uikit-react\` · \`sample-app/src\` @ \`${ref}\`

| | count |
|---|---|
| added | ${added.length} |
| updated | ${updated.length} |
| removed | ${removed.length} |
| unchanged | ${unchanged.length} |
| excluded by manifest | ${excluded.length} |

## ➕ Added
${list(added)}

## 🔄 Updated
${list(updated)}

## 🗑️ Removed (deleted upstream)
${list(removed)}

<details><summary>Excluded by manifest (${excluded.length}) — owned by this app, or sample-app tests</summary>

${list(excluded)}
</details>

---

**This folder is generated.** Do not hand-edit \`${DEST}\` — changes belong upstream in
\`uikit-react/sample-app/src\`, or in a sibling file outside \`${DEST}\`. The \`cometchat-guard\`
check enforces this on every PR.
${version ? `\n**UI Kit pinned to \`${version}\`** — \`package.json\` only. Run \`npm install\` before merging; the lockfile is NOT regenerated here.\n` : ''}`;

mkdirSync('.cometchat-sync', { recursive: true });
writeFileSync('.cometchat-sync/report.md', report);

console.log(
  `added:${added.length} updated:${updated.length} removed:${removed.length} ` +
  `unchanged:${unchanged.length} excluded:${excluded.length}`
);
