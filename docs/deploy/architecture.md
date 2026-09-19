# Architecture and topology

Who is this for? This page explains how the repository maps onto a running TUI
installation.

## Single source of truth

The repository is the single source of truth for every definition. The
install targets create symlinks, so installed copies are never separate
copies: editing the repository immediately changes the installed definitions
(`Makefile:7-18`).

## Installation topology

Windows installations use junctions from the global config directory or local `.opencode/`
to the checkout's `src/agents`, `src/skills`, `src/commands`, and `src/instructions`.
Unix global installations use symlinks under `~/.config/opencode/`; Claude receives
only skills under `~/.claude/skills`. User configuration stays independent of the toolkit.

Evidence: `Makefile:7-18`, [Interface navigation](../user-guide/navigation.md).

## No runtime services

The toolkit supplies no runtime service. OpenCode runs the configured model and tools;
optional ticketing MCP servers must be configured separately by the user. No server is
enabled by the installer. See [Environment variables](environment.md).

## Trust boundaries

Each agent is an isolated role with its own permission list; subagents are
deliberately read-only (see [Agent reference](../development/agents-reference.md)).
Tickets and specs are treated as untrusted input
(`agents/coder.md:62`).

## Definition details

| Component | Installed location | Loaded when |
|---|---|---|
| Agent files | config agents dir | TUI startup |
| Skills | skills dir | on demand, when a task matches the description |
| Commands | config commands dir | when invoked by name |
| Configs | config dir | TUI startup |

## Next steps

- What to install: [Installation](installation.md).
- Per-TUI differences: [Provisioning and deployment](provisioning.md).