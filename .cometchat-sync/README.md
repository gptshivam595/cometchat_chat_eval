# CometChat/ sync

`src/CometChat/` is **generated**. It is a byte-identical copy of
`cometchat-team/uikit-react` → `sample-app/src`, minus the files listed in `manifest.json`.

## Why it works this way

The settings seam (`SettingsProvider` / `useSettings` / `useFeatureProps`) means the sample app
takes its builder configuration as a **prop** rather than importing it. That removed the coupling
that used to force each consumer to maintain its own fork, so every consumer can now hold the exact
same copy, with all app-specific code in sibling files outside `CometChat/`.

The import direction is one-way: **builder code imports the sample app; the sample app never imports
builder code.** Keeping that true is what keeps the copy replaceable.

## The rules

1. **Never hand-edit `src/CometChat/`.** It is replaced wholesale on every UI Kit release. An edit
   here works locally and disappears at the next sync, with no error. The `cometchat-guard` check
   fails any PR that does it.
2. A change every consumer needs goes **upstream** in `uikit-react/sample-app/src`.
3. A change only this app needs goes in a **sibling file outside** `CometChat/`.
4. A file this app must own goes in `manifest.json` → `exclude` — and in the other consumers' copies
   too, since that list is meant to be identical everywhere.

## How a sync happens

```
uikit-react                              this repo
───────────                              ─────────
Release published
      │
      ▼
notify-builders-on-release.yml
  POST /dispatches ────────────────────► sync-cometchat.yml
  { ref, version }                         checkout target branch
                                           sparse-clone sample-app @ ref
                                           node scripts/sync-cometchat.mjs
                                           pin the UI Kit to <version> exactly
                                           open a signed PR
```

The PR uses a **fixed branch name**, so re-runs update the same PR rather than opening new ones.

## Testing it without cutting a release

Both workflows declare `workflow_dispatch`, so they have a **Run workflow** button in the Actions
tab. To exercise the real receiver path instead, send the dispatch by hand:

```sh
gh api -X POST /repos/cometchat-team/<this-repo>/dispatches \
  -f event_type=uikit-published \
  -F 'client_payload[ref]=master-v7' \
  -F 'client_payload[version]=7.1.0'
```

## Going live

`repository_dispatch` only fires workflows that exist on the repository's **default branch**. These
files must therefore reach `master` before the automation works — but they check out and open PRs
against `dev` / `dev-no-code`. Land them on the dev branches and let the normal promotion carry them.

**Promote before the first release you expect to trigger a sync.** A release cut while the workflow
is still only on `dev` does nothing at all — no error, no PR, just silence.

## Requirements

- Repo secrets `RELEASE_BOT_APP_ID` and `RELEASE_BOT_PRIVATE_KEY`
- The GitHub App installed on this repo **and** on `uikit-react`, with Contents: read/write and
  Pull requests: write

## What this contract does NOT cover: `src/builder/`

Only `src/CometChat/` is synced. The sibling `src/builder/` folder is owned by this app and is
deliberately **not** kept identical to the other consumers, because the three differ in shape:

| consumer | shape | theming entry point |
| --- | --- | --- |
| `uikit-builder` | several live preview instances | `useBuilderTheme(hostRef, style, theme)` |
| `uikit-builder-app` (no-code) | iframe | `generateExtendedColors(iframeDoc)` |
| this app | one standalone shell | `useBuilderTheme(style, theme)` |

A byte-identical rule here would force every consumer to carry the others' concerns, so there is no
guard for this folder. The cost is that a fix made in one repo does not arrive in the others: the
extended-colour derivation was fixed in `uikit-builder` and sat unported here long enough for a
custom brand colour to leave stock-purple avatars and selected rows in exported apps.

So: **when you change theming in `uikit-builder/src/builder/`, triage it into this app and the
no-code app by hand.** `colorUtils.ts` is currently byte-identical to `uikit-builder`'s copy — keep
it that way, and it stays the easiest file to diff when checking for drift.
