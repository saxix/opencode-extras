# Architecture and topology

Who is this for? This page explains how the repository maps onto a running TUI
installation.

## Single source of truth

The repository is the single source of truth for every definition. The
install targets create symlinks, so installed copies are never separate
copies: editing the repository immediately changes the installed definitions
(`Makefile:7-18`).

## Installation topology

```
agents-skills/
  agents/        ->  ~/.config/opencode/agents        (opencode only)
  skills/        ->  ~/.config/opencode/skills        (opencode)
                ->  ~/.claude/skills                   (Claude Code)
  commands/      ->  ~/.config/opencode/commands      (opencode only)
  opencode_cfg.jsonc -> ~/.config/opencode/opencode.jsonc
  tui_cfg.jsonc      -> ~/.config/opencode/tui.jsonc
```

Evidence: `Makefile:7-18`, [Interface navigation](../user-guide/navigation.md).

## No runtime services

The toolkit itself runs nothing: no daemons, no servers, no data plane. The
only external connections are the optional ticketing MCP servers declared in
`opencode_cfg.jsonc:21-34`, which opencode starts on demand:

- `github` -- enabled by default;
- `azure-devops` -- disabled by default.

Both run the `mcp-ticketing` binary from the project root given by
`MCP_TICKETING_HOME` (see [Environment variables](environment.md)).

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