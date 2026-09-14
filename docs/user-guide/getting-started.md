# Getting started

Who is this for? This guide is for end users who want agents, skills, and
commands available in their terminal-based AI coding assistant.

## Prerequisites

- A Unix-like shell (`bash`) and [GNU make](https://www.gnu.org/software/make/).
- At least one supported TUI: opencode (all artifacts), Claude Code (skills
  only), or another terminal assistant that reads the same Markdown formats.
- No Python, `uv`, or other build toolchain is required to install or run the
  definitions. `uv` is used only by the optional ticketing MCP servers
  ([environment variables](../deploy/environment.md)).

## Install

Install the definitions as symlinks, so the repository stays the single
source of truth:

```sh
make install-opencode   # symlink agents/, skills/, commands/ and configs into ~/.config/opencode
make install-claude     # symlink skills/ into ~/.claude/skills
```

The commands are defined in `Makefile:7-18`. `install-opencode` creates
`~/.config/opencode/` and links:

- `agents/`, `skills/`, `commands/` as directories;
- `opencode_cfg.jsonc` as `~/.config/opencode/opencode.jsonc`;
- `tui_cfg.jsonc` as `~/.config/opencode/tui.jsonc`.

Details and alternatives (including manual symlinks and a custom `PREFIX`) are
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