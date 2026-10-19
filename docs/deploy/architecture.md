# Architecture and topology

Who is this for? This page explains how the repository maps onto a running TUI
installation.

## Single source of truth

The repository is the single source of truth for every definition. The
installer copies per-item by default (`npx opencode-extras`,
`scripts/install.mjs`), or symlinks per-item with `--link` for live dev. Only
opencode is supported, so the destination is fixed by scope; default copy is
coexistence-safe across skill packs.

## Installation topology

```
src/agents/*          ->  DEST/agents/*.md        (per-item copy/link)
src/skills/<name>/    ->  DEST/skills/<name>/     (per-item copy/link)
src/commands/*.md     ->  DEST/commands/*.md      (per-item copy/link)
src/_shared/<name>/   ->  DEST/_shared/<name>/    (per-dir copy/link)
```

The last rule covers any top-level `src/` directory other than `agents`,
`skills`, `commands`, and the reserved `plugins/`: shared specs are mirrored
under the same name so the TUI never discovers them as agents. Only `skills/`
gets the `sax-` name prefix; `agents/` and `commands/` do not.

`DEST` is `~/.config/opencode` for global installs or `./.opencode` for
`--project`. Default `--copy` never creates a directory symlink
(`skills -> src/skills`), so multiple packs coexist.

Evidence: `scripts/install.mjs`, [Installation](installation.md).

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
- Scope and destinations: [Interface navigation](../user-guide/navigation.md).
