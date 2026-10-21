# Contributing

Thanks for considering a contribution to `opencode-extras`. This project holds
reusable agents, skills, and commands for the [opencode](https://opencode.ai)
terminal assistant. The content is plain Markdown; the only code is a small
Node installer and its test suite.

## Before you start

- Node.js 18 or newer (`package.json` declares `"engines": { "node": ">=18" }`).
- No `npm install` is needed: the installer has no runtime dependencies and the
  tests use the built-in `node:test` runner.
- For a live install from a checkout, see the "Install Development Mode"
  section in [README.md](README.md).

## Run the tests

Run the full suite before you open a pull request:

```sh
npm test
```

That expands to `node --test tests/*.test.mjs`. It never runs the agent, git, or
the network, so it is fast and safe to run on every change.

Run a single suite while you work:

```sh
node --test tests/uninstall.test.mjs
```

The suite covers five areas:

| Area | File | What it guards |
|---|---|---|
| Install | `tests/install.test.mjs` | Installer behavior, frontmatter validity, AGENTS.md sync |
| Uninstall | `tests/uninstall.test.mjs` | Removal, idempotency, dry-run honesty, user-owned paths |
| Content | `tests/content-*.test.mjs` | Definition and documentation content rules |
| Golden | `tests/golden-*.test.mjs` | Analyst workflows and bookmark roundtrips |
| Fixtures | `tests/fixtures.test.mjs` | Reviewer evaluation case contract and verdict rules |

Tests create their temporary prefixes under `~work/` inside the repository and
delete them afterward. Set `KEEP_WORK=1` to keep them for inspection.

If you changed anything under `src/`, regenerate the reference pages first and
commit the result, or CI will fail:

```sh
node scripts/gen-references.mjs
```

CI runs `node scripts/gen-references.mjs --check` and then `npm test` on Node
18, 20, and 22. Reproduce that locally and your pull request should be green.

### Reviewer evaluation (optional)

`tests/fixtures.test.mjs` checks the reviewer evaluation cases without running
the agent. The live run is deliberately outside `npm test` because it needs the
`opencode` binary, a configured provider, and it costs tokens and time:

```sh
npm run eval:reviewer               # every case
node tests/eval/run-eval.mjs --keep reviewer-clean-branch   # one case
```

See [docs/maintainers/development.md](docs/maintainers/development.md) for what
each case does and how the automatic verdict works.

## Open an issue

Use the GitHub issue tracker:
<https://github.com/saxix/opencode-extras/issues>.

Check that a similar issue is not already open before you file one. Search the
open and closed issues for the error text or the feature you have in mind.

A good issue is small, specific, and reproducible. Include:

- **What you expected** and **what happened**, in one or two sentences.
- **Steps to reproduce**, with the exact command or the exact words you typed to
  the agent (for example `review code`, `review diff`, `npx opencode-extras`).
- **The version**: `opencode --version` (or the opencode-extras release).
- **The relevant output**, pasted as a fenced code block, including any
  `Permission denied` line or error text in full.
- **Your environment**: OS, shell, and Node.js version if the installer or a
  test is involved.

For a bug in one agent, skill, or command, say which one, for example the
`reviewer` agent or the `sax-pr-review` skill. That is usually enough to locate
the file.

Do not paste secrets, tokens, or private repository content into an issue. Trim
paths and payloads down to what is needed to reproduce the problem.

If you want to propose a fix yourself as well, say so in the issue, then follow
the pull request rules below.

## Changes to the definitions

The definitions are the product. Rules live in one place: a shared rule belongs
in the skill that owns it, and an agent loads that skill rather than restating
the rule. Keep changes consistent with the structure, naming, style, and output
convention of the surrounding files.

- Each skill keeps a `SKILL.md` at its directory root with `name:` and
  `description:` frontmatter.
- Agents and commands use Markdown with `description:` frontmatter, which is
  mandatory.
- All generated output (handoffs, reviews, reports, commit messages) must render
  in the opencode TUI and stay readable in any plain Markdown renderer: plain
  CommonMark, ASCII-first, ATX headings. See the "TUI-portable output" section in
  [AGENTS.md](AGENTS.md).

## Pull requests

1. Work on the content or code, and keep the change focused on one idea.
2. Run `node scripts/gen-references.mjs` if you touched `src/`.
3. Run `npm test`; it must be green.
4. Describe what changed and why, and link the issue it closes, if any.

Small, well-scoped pull requests are reviewed fastest.
