# Interface navigation

Who is this for? This page describes where agents, skills, and commands live
once installed, and how the toolkit maps onto each TUI.

## Where definitions live

Definitions live under `src/agents`, `src/skills`, `src/commands`, and `src/instructions`.
The Windows installer links them globally under the user's OpenCode config directory or
locally under `<project-or-workspace>/.opencode/`; Unix Make targets link
them under `~/.config/opencode/`. Claude receives skills only under `~/.claude/skills/`.
No provider, model, TUI, or MCP config is installed. See `scripts/install-workspace.ps1`
and `Makefile` for the mappings.

## opencode

- **Agents** are registered from `~/.config/opencode/agents/`. The file body
  becomes the agent prompt; frontmatter provides `description`, `mode`,
  `color`, `steps`, and `permission`. Workspace installs use `.opencode/agents/`.
- **Skills** are discovered by scanning for `SKILL.md` files under global or workspace
  skill directories. A skill is loaded on demand only when its
  description matches the task.
- **Commands** come from global or workspace command directories, one Markdown file per
  command.
- **Configuration** is split: `opencode.jsonc` (global behavior, providers,
  MCP servers) and `tui.jsonc` (interface settings). Both are loaded once at
  startup.

## Claude Code

- **Skills only.** `install-claude` symlinks `src/skills/` into
  `~/.claude/skills/` (`Makefile:17-18`). Agents, commands, and the opencode
  configs are not installed for Claude Code.

## Other TUIs

Terminal assistants that read the same Markdown formats (Gemini CLI, hermes)
consume the definitions as portable Markdown. Per-TUI settings in frontmatter
(`agent`, `mode`, `color`, `steps`, `permission`) are optional and ignored by
TUIs that do not use them (`README.md:77`).

## After any change

Because definitions are symlinked, editing the repository is enough to update
the installed copy; then restart the TUI to reload configuration and agent
lists.

## Next steps

- Install details and alternatives: [Installation](../deploy/installation.md).
- Settings and frontmatter reference: [Configuration reference](../admin/configuration.md).