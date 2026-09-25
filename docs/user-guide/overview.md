# Overview and key features

Who is this for? This guide is for people who want to use `agents-skills` in
their terminal-based AI coding assistant: developers, technical writers, and
maintainers who want prebuilt roles and routines instead of writing prompts
from scratch each time.

## What it is

`agents-skills` is a collection of reusable definitions for AI coding TUIs:

- **Agents** -- role definitions such as Business Analyst, System Analyst, and
  Ticket Implementer, each with an operating contract, permissions, a state
  machine, and a handoff format.
- **Skills** -- specialized instruction bundles loaded on demand, from code
  review and security audits to commit hygiene and dependency upgrades.
- **Commands** -- slash-command prompt bodies that run a constrained workflow,
  for example "deconstruct a task into an idempotent plan".

All definitions are plain Markdown with YAML frontmatter. The same files work
in `opencode`, Claude Code, Codex, pi, Gemini CLI, hermes, and other terminal
assistants (`README.md:3`). The repository ships a Node installer
(`package.json:10`, `scripts/install.mjs:1`) and a minimal test suite
(`tests/install.test.mjs:1`, `npm test`); no application runtime is required.

## Key features

- **TUI-portable output standard.** Every agent, skill, and command must emit
  output that renders correctly in any terminal assistant: plain CommonMark,
  ASCII-first, ATX headings, narrow tables, self-contained evidence
  (`AGENTS.md:118-131`).
- **Read-only analysis roles.** The System Analyst and its discovery subagents
  inspect the codebase without editing, then present implementation options
  for a human decision (`agents/system-analyst.md:42-74`).
- **Explicit approval gates.** The Business Analyst and System Analyst do not
  mutate tickets or choose technical directions without user approval
  (`agents/business-analyst.md:85`, `agents/system-analyst.md:69`).
- **Explicit analyst bookmarks.** `issue-save`, `issue-list`, and `issue-load`
  persist and restore compact analyst state only when explicitly invoked in an
  active analyst session; there is no autosave.
- **Deny-by-default permissions.** Agents explicitly allow a narrow write
  surface (for example the Documenter may only write `docs/**`, `README*`, and
  `properdocs.yml` / `properdocs.yaml`, `agents/documenter.md:14-28`).
- **One-skill-per-directory layout.** Each skill has a `SKILL.md` entrypoint
  and optional reference material (see the
  [skill reference](../development/skills-reference.md)).
- **Plug-and-play install.** One `npx` command copies per-item into the default
  OpenCode config (`npx opencode-utils`), with `--agent` for other targets
  (see [getting started](getting-started.md) and
  [installation](../deploy/installation.md)).

## What you get

| Artifact | Count | Reference |
|---|---|---|
| Agents | 10 | [agent reference](../development/agents-reference.md) |
| Skills | 23 | [skill reference](../development/skills-reference.md) |
| Commands | 12 | [command reference](../development/commands/debug-code.md) |

## Next steps

- Install the toolkit: [Getting started](getting-started.md).
- Run the ticket pipeline: [Agent workflows](workflows/agents.md).
- Browse the inventories: [agent reference](../development/agents-reference.md),
  [skill reference](../development/skills-reference.md).