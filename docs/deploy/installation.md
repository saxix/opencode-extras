# Installation

Who is this for? This page is the operational reference for installing the
toolkit into a TUI. End users should start with
[Getting started](../user-guide/getting-started.md).

## Install for opencode

```sh
make install-opencode
```

This target (`Makefile:7-18`) creates `~/.config/opencode/` and symlinks:

| Repository path | Installed as |
|---|---|
| `agents/` | `~/.config/opencode/agents` |
| `skills/` | `~/.config/opencode/skills` |
| `commands/` | `~/.config/opencode/commands` |
| `opencode_cfg.jsonc` | `~/.config/opencode/opencode.jsonc` |
| `tui_cfg.jsonc` | `~/.config/opencode/tui.jsonc` |

The symlinks are created with `ln -sfn`, so the command is idempotent and can
be re-run to repair stale links. The root-level `opencode.jsonc` project
sample is not installed by this target.

## Install for Claude Code

```sh
make install-claude
```

This target (`Makefile:17-18`) symlinks only `skills/` into
`~/.claude/skills`. Agents, commands, and configs are opencode-specific.

## Custom prefix

`install-opencode` supports overriding the destination home with `PREFIX`:

```sh
make PREFIX=/some/other/home install-opencode
```

The same mechanism powers the sandbox smoke test (`Makefile:24-27`).

## Manual install

Instead of make, create the symlinks by hand:

```sh
mkdir -p ~/.config/opencode
ln -sfn "$PWD/skills"   ~/.config/opencode/skills
ln -sfn "$PWD/agents"   ~/.config/opencode/agents
ln -sfn "$PWD/commands" ~/.config/opencode/commands
ln -sfn "$PWD/opencode_cfg.jsonc" ~/.config/opencode/opencode.jsonc
ln -sfn "$PWD/tui_cfg.jsonc"      ~/.config/opencode/tui.jsonc
```

## After install

1. Restart the TUI so it reloads configuration and agent lists.
2. Verify agents, skills, and commands are visible
   ([Interface navigation](../user-guide/navigation.md)).
3. Create the local credentials file if the ticketing servers will be used
   ([Environment variables](environment.md)).

## Uninstall

Remove the symlinks (and any `tui.jsonc` created by the install):

```sh
rm ~/.config/opencode/agents ~/.config/opencode/skills ~/.config/opencode/commands
rm ~/.config/opencode/opencode.jsonc ~/.config/opencode/tui.jsonc
rm -rf ~/.claude/skills   # if installed for Claude Code
```

## Next steps

- Per-TUI deployment details: [Provisioning and deployment](provisioning.md).
- Environment variables: [Environment variables](environment.md).