# Getting started

Who is this for? This guide is for end users who want agents, skills, and
commands available in their terminal-based AI coding assistant.

## Prerequisites

- Node.js 18+ and `npx` (for `npx opencode-utils`), or [GNU make](https://www.gnu.org/software/make/) as wrapper.
- At least one supported TUI: opencode, Claude Code, or Codex (all artifacts: agents, skills, commands).
- No Python, `uv`, or other build toolchain is required to install or run the
  definitions. `uv` is used only by the optional ticketing MCP servers
  ([environment variables](../deploy/environment.md)).

## Install

Via `npx` (copy per-item, coexistence-safe):

```sh
npx opencode-utils --global --all              # global ~/.config/opencode/skills/sax-* + ~/.claude/skills/sax-* + ~/.codex/skills/sax-*
npx opencode-utils --project --all             # project ./.opencode/skills/sax-* + ./.claude/skills/sax-* + ./.codex/skills/sax-*
npx opencode-utils --global --opencode         # only opencode
npx opencode-utils --global --claude           # only claude
npx opencode-utils --global --codex            # only codex
npx opencode-utils --project --link --all      # dev live symlinks (opt-in)
npx opencode-utils --project --compat          # project compat ./.agents/skills/sax-* (instead of dedicated folders)
```

Via `make` (wrapper to `npx`):

```sh
make install              # global --all (copy)
make install-project      # project --all (copy)
```

The installer copies per-item (`skills/sax-<name>/`, `agents/*.md`, `commands/*.md`)
so multiple skill packs coexist (no directory symlink). Skills use prefix `sax-` to avoid collisions. Use `--link` for live
dev symlinks: `npx opencode-utils --project --link --all`. For a local clone use `node ./scripts/install.mjs --project --link --all` from the target project (see [installation guide](../deploy/installation.md) for clone + `.agents` compat).

Install from a local clone (dev):

```sh
git clone https://github.com/saxix/opencode-utils.git
node ./scripts/install.mjs --project --link --all          # .opencode/skills/sax-*
node ./scripts/install.mjs --project --compat --link       # .agents/skills/sax-*
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
   a technical direction (`agents/business-analyst.md:63`).

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