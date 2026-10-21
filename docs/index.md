# opencode-extras

Reusable **agents**, **skills**, and **commands** for the
[opencode](https://opencode.ai) terminal assistant. All definitions are plain
Markdown with YAML frontmatter and follow a TUI-portable output standard, so
they stay readable in any terminal.

## What is in the box

| Artifact | Count | Reference |
|---|---|---|
| Agents | 13 | [Agent reference](reference/agents.md) |
| Skills | 26 | [Skill reference](reference/skills.md) |
| Commands | 9 | [Command reference](reference/commands.md) |
| Plugins | 1 | [Plugin reference](reference/plugins.md) |

## Install

```sh
npx opencode-extras              # global (~/.config/opencode)
npx opencode-extras --project    # project (.opencode)
```

Default is `--copy` per-item, which keeps other skill packs intact. For live
symlinks from a local checkout use `node ./scripts/install.mjs --global --link`.
Full options, uninstall, and troubleshooting: [Getting started](user-guide/getting-started.md).

## Guides

| Guide | Audience | What it covers |
|---|---|---|
| [User Guide](user-guide/overview.md) | End users | What the agents, skills, and commands do; install and first run |
| [Reference](reference/agents.md) | End users and maintainers | One entry per agent, skill, command, and plugin |
| [Maintainers](maintainers/conventions.md) | Contributors | Conventions, local test loop, CI, releasing |

## Repository layout

| Path | Contents |
|---|---|
| `src/agents/` | Agent definitions (Markdown + frontmatter) |
| `src/skills/` | Skills, one directory per skill with a `SKILL.md` entrypoint |
| `src/commands/` | Slash-command prompt bodies |
| `src/_shared/` | Shared specs installed under the same name |
| `src/plugins/` | TypeScript plugins (not installed by the installer) |
| `scripts/install.mjs` | Zero-dependency installer (`npx opencode-extras`) |
| `scripts/gen-references.mjs` | Generator for the pages under `docs/reference/` |
| `tests/` | `node:test` suite (`npm test`) plus the reviewer evaluation fixtures |
| `tests/eval/` | Live agent evaluation runner (`npm run eval:reviewer`) |
| `docs/` | This documentation site (properdocs) |

The repository contains a small Node installer and its tests; there is no
application runtime, lint, typecheck, or bundler. The features are the
definitions themselves (`AGENTS.md`).
