# Development

Who is this for? Contributors working on the definitions, the installer, or the
documentation.

## Prerequisites

- Node.js 18 or newer (`package.json` declares `"engines": { "node": ">=18" }`).
- Python 3.10+ with `properdocs` only if you want to preview the docs site.

No `npm install` is required: the installer has no runtime dependencies and the
test suite uses the built-in `node:test` runner.

## Test loop

```sh
npm test                          # node --test tests/*.test.mjs
node --test tests/uninstall.test.mjs   # a single suite
```

The suite covers five areas:

| File | What it guards |
|---|---|
| `tests/install.test.mjs` | Installer behavior, frontmatter validity, AGENTS.md sync |
| `tests/uninstall.test.mjs` | Removal, idempotency, dry-run honesty, user-owned paths |
| `tests/content-*.test.mjs` | Definition and documentation content rules |
| `tests/golden-*.test.mjs` | Analyst workflows and bookmark roundtrips |
| `tests/fixtures.test.mjs` | Reviewer evaluation case contract and verdict rules |

Tests create their temporary prefixes under `~work/` inside the repository and
delete them afterward. Set `KEEP_WORK=1` to keep them for inspection.

## Reviewer evaluation

`tests/fixtures/reviewer/` holds sample projects that exercise the `reviewer`
agent. `tests/fixtures.test.mjs` validates the case contract, the project config,
and the hunk edits without touching git or the network; it runs inside `npm test`.

The live run is deliberately outside the test runner because it needs the
`opencode` binary, a configured provider, and it costs tokens and time:

```sh
npm run eval:reviewer               # every case
node tests/eval/run-eval.mjs --keep reviewer-clean-branch   # one case, keep the tree
```

Each case is materialized into a temporary git repository (or a plain directory
for `working-tree` cases), the reviewer is run with `--standalone`, and its output
and automatic verdict are written to `tests/fixtures/reviewer/expectations.md`.
That file is committed so the latest evaluated output stays reviewable.

The runner strips `OPENCODE*` and `DIRENV*` from the child environment and
repoints `PWD` at the fixture: an inherited session makes the child attach to the
caller's project and review the wrong tree.

The verdict rules (how a denial and an expectation are read) and the argument
parsing live in `tests/eval/verdict.mjs` and are covered by
`tests/fixtures.test.mjs`, so they do not need a live run to be checked. A denial
of a command the reviewer is not allowed to run is expected and does not fail a
case; a denial of an allowlisted command, which would mean the agent and its
policy disagree, does.

## Adding or changing a definition

1. Edit the file under `src/agents/`, `src/skills/`, or `src/commands/`.
2. Keep the frontmatter contract (`description:` is mandatory).
3. Regenerate the catalogs:
   ```sh
   node scripts/gen-references.mjs
   ```
4. Update the tables in `AGENTS.md` and, if counts changed, `docs/index.md` and
   `docs/user-guide/overview.md`.
5. Run `npm test`. The suite fails if a generated page, the AGENTS.md table, or
   a documentation link is stale.
6. Preview the site:
   ```sh
   properdocs serve        # http://127.0.0.1:8000/opencode-extras/
   ```

## Installer internals

`scripts/install.mjs` is a zero-dependency ES module. It parses a small flag
set (`--global`, `--project`, `--copy`, `--link`, `--prefix`, `--uninstall`,
`--dry-run`) and installs per item:

| Source | Destination (global) | Destination (project) |
|---|---|---|
| `src/skills/<name>/` | `~/.config/opencode/skills/sax-<name>/` | `./.opencode/skills/sax-<name>/` |
| `src/agents/*.md` | `~/.config/opencode/agents/` | `./.opencode/agents/` |
| `src/commands/*.md` | `~/.config/opencode/commands/` | `./.opencode/commands/` |
| `src/plugins/` | not installed | not installed |

`--copy` is the default; `--link` creates per-item symlinks. Directories
`skills/`, `agents/`, and `commands/` are never symlinked as a whole. Uninstall
removes only known items and never touches `plugins/`, which belongs to the
user. Dry-run reports only paths that actually exist.

Any other top-level directory under `src/` is not installed: opencode loads
agents, skills, and commands only, so the installer warns about it. Move the
content into a skill (`src/skills/<name>/SKILL.md`) or a command.
