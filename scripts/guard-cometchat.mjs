// Fail a PR that hand-edits the generated src/CometChat/ folder.
//
// Divergence here is forbidden outright, because the whole point of the settings seam is that this
// folder is a byte-identical copy of uikit-react/sample-app/src.
//
// Without this, the failure is silent and expensive: someone fixes a bug directly in
// src/CometChat/, it works locally, and the next release sync overwrites it. The fix vanishes and
// nobody knows why. So: edits here are rejected at PR time, with the two legitimate routes named.
//
// Escape hatch: commits whose message contains [sync-cometchat] are allowed to touch the folder —
// that is how the sync job's own PR passes. The check is PER COMMIT, not per PR: an earlier
// version skipped the whole range if any commit carried the marker, which let a hand-edit pushed
// onto a sync branch ride through unnoticed.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('.cometchat-sync/manifest.json', 'utf8'));
const DEST = manifest.destination;

const base = process.env.BASE_SHA;
const head = process.env.HEAD_SHA;
if (!base || !head) {
  console.error('BASE_SHA and HEAD_SHA must be set (the workflow supplies them)');
  process.exit(2);
}

const sh = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

// Walk the range commit by commit. A commit may touch DEST only if it carries the sync marker.
const commits = sh(`git rev-list --reverse ${base}..${head}`).split('\n').filter(Boolean);

const offenders = [];   // [{ sha, subject, files }]
let syncCommits = 0;

for (const sha of commits) {
  const files = sh(`git show --pretty=format: --name-only ${sha}`)
    .split('\n')
    .filter(Boolean)
    .filter((f) => f.startsWith(DEST + '/'));
  if (!files.length) continue;

  const message = sh(`git log -1 --format=%s%n%b ${sha}`);
  if (message.includes('[sync-cometchat]')) { syncCommits++; continue; }

  offenders.push({ sha: sha.slice(0, 8), subject: sh(`git log -1 --format=%s ${sha}`), files });
}

if (!offenders.length) {
  console.log(
    syncCommits
      ? `✅ cometchat-guard OK — ${syncCommits} sync commit(s), no hand-edits to ${DEST}/`
      : `✅ cometchat-guard OK — no changes to ${DEST}/`
  );
  process.exit(0);
}

const total = offenders.reduce((n, o) => n + o.files.length, 0);
console.error(`\n❌ ${total} file(s) changed inside the generated folder ${DEST}/ by ${offenders.length} non-sync commit(s):\n`);
for (const o of offenders) {
  console.error(`   ${o.sha}  ${o.subject}`);
  o.files.forEach((f) => console.error('      ' + f));
}
console.error(`
${DEST}/ is a byte-identical copy of uikit-react/sample-app/src and is replaced wholesale on every
UI Kit release. An edit here works locally and is silently overwritten by the next sync.

Two legitimate routes:

  1. The change belongs to every consumer  ->  make it upstream in
     cometchat-team/uikit-react, sample-app/src. It arrives here on the next release.

  2. The change is specific to THIS app    ->  put it in a sibling file outside ${DEST}/.
     Builder code imports the sample app; the sample app never imports builder code.

If a file genuinely needs to be owned by this app, add it to "exclude" in
.cometchat-sync/manifest.json — and add the same entry in the other consumers, since that list is
meant to be identical everywhere.
`);
process.exit(1);
