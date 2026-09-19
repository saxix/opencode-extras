# Installation

## Windows: global or local

Run from the toolkit checkout in PowerShell 5.1 or newer:

```powershell
.\scripts\install-opencode.ps1 -Global -WhatIf
.\scripts\install-opencode.ps1 -Global
# Or install locally in one existing project or parent workspace:
.\scripts\install-opencode.ps1 -WorkspaceRoot 'C:\work\projects'
```

Global mode is also the default when no scope arguments are supplied. Its destination is
`$HOME/.config/opencode`, or `$XDG_CONFIG_HOME/opencode` when that environment variable is set.
Use `-Global -ConfigRoot <directory>` to target a custom config directory; wire that directory
into OpenCode yourself (for example through `OPENCODE_CONFIG_DIR`). It is not activated merely
by creating links there. `make install` / `make install-opencode` use global mode on Windows.

Local mode requires an existing project or workspace. `install-workspace.ps1 -WorkspaceRoot ...`
remains a backward-compatible wrapper. The installer derives sources from its own location,
not the caller's directory. Local junctions are:

- `src/agents` -> `<workspace>/.opencode/agents`
- `src/skills` -> `<workspace>/.opencode/skills`
- `src/commands` -> `<workspace>/.opencode/commands`
- `src/instructions` -> `<workspace>/.opencode/instructions`

It preflights all destinations, accepts existing matching junctions, and refuses conflicts.
It never replaces existing directories, links, or configuration. Junctions on supported local
Windows filesystems avoid the symbolic-link privilege requirement of `mklink /D`.

Both modes link the same generic definitions. For optional shared operating rules, merge
this field into a local `opencode.json`, preserving other fields:

```json
{
  "instructions": [".opencode/instructions/workspace.md"]
}
```

Append to an existing `instructions` array rather than replacing it. An absolute path using
forward slashes is also supported and makes the intended workspace explicit. Keep provider,
model, and MCP settings in the existing user/workspace configuration.

For global instructions, use the absolute installed `instructions/workspace.md` path in the
user configuration. Standalone projects need no parent workspace or report directory.
Quit and restart OpenCode from the project or workspace root. Runtime verification is described in
`docs/development/testing.md`; operating conventions are in `docs/user-guide/workspace.md`.

## Unix global installation

```sh
make install-opencode
make install-claude
```

`make install` aliases `install-opencode`. OpenCode definitions are symlinked from `src/`
under `~/.config/opencode/`; Claude receives only `src/skills` under `~/.claude/skills`.
Use `make PREFIX=/existing/home install-opencode` for a different prefix. Existing conflicting
paths are refused. No provider, model, MCP, or TUI configuration is installed.

To load shared instructions globally, add the installed `instructions/workspace.md` absolute
path to your own config's `instructions` array. Other TUIs need their own instruction wiring.

## Updating and uninstalling

Linked definitions track the checked-out toolkit files. Restart the assistant after updates.
Keep the checkout at a stable path; moving it requires recreating the links.

To uninstall, inspect the destination and remove only the verified junctions/symlinks, without
recursing into their source targets. Remove only this toolkit's entry from `instructions`.
Keep unrelated configuration and any pre-existing user definitions. Never recursively delete
a linked directory tree as an uninstall procedure.

For a Windows Claude installation, manually link or copy `src/skills` to the skill directory
supported by that client, preserving existing content. The Windows installer targets OpenCode.