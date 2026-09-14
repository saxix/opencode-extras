# Interface navigation

Who is this for? This page describes where agents, skills, and commands live
once installed, and how the toolkit maps onto each TUI.

## Where definitions live

Source of truth is the repository; installed copies are symlinks.

| Artifact | Repository | Installed by `install-opencode` | Installed by `install-claude` |
|---|---|---|---|
| Agents | `agents/` | `~/.config/opencode/agents/` | not installed |
| Skills | `skills/` | `~/.config/opencode/skills/` | `~/.claude/skills/` |
| Commands | `commands/` | `~/.config/opencode/commands/` | not installed |
| Global config | `opencode_cfg.jsonc` | `~/.config/opencode/opencode.jsonc` | not installed |
| TUI config | `tui_cfg.jsonc` | `~/.config/opencode/tui.jsonc` | not installed |

Evidence: `Makefile:7-18`. The root-level `opencode.jsonc` in the repository
is a project-scope sample and is not installed by the make targets
(`opencode.jsonc`).

## opencode

- **Agents** are registered from `~/.config/opencode/agents/`. The file body
  becomes the agent prompt; frontmatter provides `description`, `mode`,
  `color`, `steps`, and `permissions`.
- **Skills** are discovered by scanning for `SKILL.md` files under
  `~/.config/opencode/skills/`. A skill is loaded on demand only when its
  description matches the task.
- **Commands** come from `~/.config/opencode/commands/`, one Markdown file per
  command.
- **Configuration** is split: `opencode.jsonc` (global behavior, providers,
  MCP servers) and `tui.jsonc` (interface settings). Both are loaded once at
  startup.

## Claude Code

- **Skills only.** `install-claude` symlinks `skills/` into
  `~/.claude/skills/` (`Makefile:17-18`). Agents, commands, and the opencode
  configs are not installed for Claude Code.

## Other TUIs

Terminal assistants that read the same Markdown formats (Gemini CLI, hermes)
consume the definitions as portable Markdown. Per-TUI settings in frontmatter
(`agent`, `mode`, `color`, `steps`, `permissions`) are optional and ignored by
TUIs that do not use them (`README.md:77`).

## After any change

Because definitions are symlinked, editing the repository is enough to update
the installed copy; then restart the TUI to reload configuration and agent
lists.

## Next steps

- Install details and alternatives: [Installation](../deploy/installation.md).
- Settings and frontmatter reference: [Configuration reference](../admin/configuration.md).