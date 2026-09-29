# Getting started

Who is this for? This guide is for end users who want agents, skills, and
commands available in their terminal-based AI coding assistant.

## Prerequisites

- Node.js 18+ and `npx` (for `npx opencode-utils`).
- At least one supported TUI: opencode, Claude Code, Codex, or pi.
- No Python, `uv`, or other build toolchain is required to install or run the
  definitions. `uv` is used only by the optional ticketing MCP servers
  ([environment variables](../deploy/environment.md)).

## Install

The default target is `opencode`, installed globally:

```sh
npx opencode-utils
npx opencode-utils --project
npx opencode-utils --agent claude --global
npx opencode-utils --agent codex --project
npx opencode-utils --agent pi --global
npx opencode-utils --agent compat
npx opencode-utils --agent opencode --link
```

`--agent compat` selects the project `.agents` layout and implies `--project`.
Use `--agent` with one target per invocation; `opencode` is the default.

The installer copies per-item (`skills/sax-<name>/`, `agents/*.md`, `commands/*.md`)
so multiple skill packs coexist (no directory symlink). Skills use prefix `sax-` to
avoid collisions. Use `--link` for live dev symlinks, or `--agent compat` for the
project `.agents` layout. For a local clone, use the `node` command below; `npx`
installs the published package.

Install from a local clone (dev):

```sh
git clone https://github.com/saxix/opencode-utils.git
node ./scripts/install.mjs --project --link --agent opencode
node ./scripts/install.mjs --agent compat --link
```

Details and alternatives (including `PREFIX` and `--dry-run`) are
in the [installation guide](../deploy/installation.md).

## Restart your TUI

Configurations are loaded once when the TUI starts. After installing, quit and
restart the assistant so it picks up the new agents, skills, and commands.
A running session keeps using the configuration it loaded at startup.

## First run

1. Open your TUI in a project worktree.
2. Ask for a task that matches an agent description, for example "document
   this project" (triggers the [documenter agent](../development/agents-reference.md#documenter)).
   Keyword triggers live in each definition's `description:` frontmatter.
3. Or name a workflow directly, for example "create a ticket for this idea"
   (triggers the [Business Analyst](../development/agents-reference.md#business-analyst)).
4. Review the agent's proposal before it acts: the Business Analyst and System
   Analyst stop at explicit approval gates before creating a ticket or locking
   a technical direction (`agents/business-analyst.md:85`, `agents/system-analyst.md:69`).

## Save and resume analyst work

Start a session with the Business Analyst or System Analyst, then ask in plain
language:

```text
save this work as requirements-review
list my bookmarks
load requirements-review
```

The active analyst loads the
[issue-bookmarks skill](../development/skills-reference.md#issue_bookmarks) and
follows the matching operation. Saving stores compact current work under that
analyst's `.ai-temp/` directory. Listing shows that analyst's bookmarks, newest
first, and loading restores one. Nothing happens if the loaded agent is not
exactly `business-analyst` or `system-analyst`. There is no autosave: only an
explicit request writes a file.

## Verify the install

- Agents appear in the assistant's agent list after restart.
- Skills load on demand: a task matching a skill description (for example
  "audit the code") triggers the
  [security skill](../development/skills-reference.md#security).
- Commands run when invoked by name (see the
  [command reference](../development/commands/debug-code.md)).

## Next steps

- Understand the full pipeline: [Agent workflows](workflows/agents.md).
- Configure behavior: [Configuration reference](../admin/configuration.md).
- Install on another machine or TUI: [Deploy guide](../deploy/installation.md).