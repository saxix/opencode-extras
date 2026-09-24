# Architecture and topology

Who is this for? This page explains how the repository maps onto a running TUI
installation.

## Single source of truth

The repository is the single source of truth for every definition. The
installer copies per-item by default (`npx opencode-utils --global --all`,
`scripts/install.mjs:214`), or symlinks per-item with `--link` for live dev
(`Makefile:7-18` legacy). Default copy is coexistence-safe across skill packs.

## Installation topology

```
src/agents/*          ->  DEST/agents/*.md        (per-item copy/link)
src/skills/<name>/    ->  DEST/skills/<name>/     (per-item copy/link)
src/commands/*.md     ->  DEST/commands/*.md      (per-item copy/link)
```

`DEST` is `~/.config/opencode` (opencode), `~/.claude` (Claude Code),
`~/.codex` (Codex), or `./.opencode` etc. for `--project` (`scripts/install.mjs:102`).
Default `--copy` never creates a directory symlink (`skills -> src/skills`), so
multiple packs coexist (`Makefile:7-18` legacy used dir symlinks).

Evidence: `scripts/install.mjs:214`, [Installation](installation.md).

## No runtime services

The toolkit itself runs nothing: no daemons, no servers, no data plane. The
only external connections are the optional ticketing MCP servers declared in
`src/~opencode_cfg.jsonc:21-34`, which opencode starts on demand:

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