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
in `opencode`, Claude Code, Gemini CLI, hermes, and other terminal assistants
(`README.md:3`). The repository is deliberately free of application code,
tests, and CI (`README.md:95`).

## Key features

- **TUI-portable output standard.** Every agent, skill, and command must emit
  output that renders correctly in any terminal assistant: plain CommonMark,
  ASCII-first, ATX headings, narrow tables, self-contained evidence
  (`AGENTS.md:85-98`).
- **Read-only analysis roles.** The System Analyst and its discovery subagents
  inspect the codebase without editing, then present implementation options
  for a human decision (`agents/system-analyst.md:26-28`).
- **Explicit approval gates.** The Business Analyst and System Analyst do not
  mutate tickets or choose technical directions without user approval
  (`agents/business-analyst.md:63`).
- **Role-specific permissions.** Analysts save scratch by default; persistent reports require
  local policy and permissions. Documenter writes documentation and supported site configuration.
  Read-only subagents cannot edit files.
- **One-skill-per-directory layout.** Each skill has a `SKILL.md` entrypoint
  and optional reference material (see the
  [skill reference](../development/skills-reference.md)).
- **Linked installation.** PowerShell installs Windows global or local junctions; Make targets
  install Unix global symlinks (see [getting started](getting-started.md)).

## What you get

| Artifact | Count | Reference |
|---|---|---|
| Agents | 8 | [agent reference](../development/agents-reference.md) |
| Skills | 21 | [skill reference](../development/skills-reference.md) |
| Commands | 9 | [command reference](../development/commands/debug-code.md) |

## Next steps

- Install the toolkit: [Getting started](getting-started.md).
- Run the ticket pipeline: [Agent workflows](workflows/agents.md).
- Browse the inventories: [agent reference](../development/agents-reference.md),
  [skill reference](../development/skills-reference.md).