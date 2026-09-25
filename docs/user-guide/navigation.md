# Interface navigation

Who is this for? This page describes where agents, skills, and commands live
once installed, and how the toolkit maps onto each TUI.

## Where definitions live

The repository is the source of truth. The installer copies definitions by
default; `--link` creates live symlinks to a local checkout.

| `--agent` value | Global destination | Project destination |
|---|---|---|
| `opencode` | `~/.config/opencode` | `./.opencode` |
| `claude` | `~/.claude` | `./.claude` |
| `codex` | `~/.codex` | `./.codex` |
| `pi` | `~/.pi` | `./.pi` |
| `compat` | not supported | `./.agents` (implies `--project`) |

The root-level `opencode.jsonc` in the repository is a project-scope sample and
is not installed by the target installer (`opencode.jsonc`).

## opencode

- **Agents** are registered from `~/.config/opencode/agents/`. The file body
  becomes the agent prompt; frontmatter provides `description`, `mode`,
  `color`, `steps`, and `permissions`.
- **Skills** are discovered by scanning for `SKILL.md` files under
  `~/.config/opencode/skills/`. A skill is loaded on demand only when its
  description matches the task.
- **Commands** come from `~/.config/opencode/commands/`, one Markdown file per
  command. Bookmark commands omit a forced `agent:` so they can verify and use
  the analyst loaded in the current session.
- **Configuration** is split: `opencode.jsonc` (global behavior, providers,
  MCP servers) and `tui.jsonc` (interface settings). Both are loaded once at
  startup.

## Claude Code, Codex, and pi

The installer writes the portable `agents/`, `skills/`, and `commands/` layout
to the selected target directory. Each TUI decides which parts it loads.

## Other TUIs

Terminal assistants that read the same Markdown formats consume the definitions
as portable Markdown. Per-TUI settings in frontmatter (`agent`, `mode`, `color`,
`steps`, `permissions`) are optional and ignored by TUIs that do not use them.

## After any change

Copy installations update when the installer is rerun. Linked installations
update when the checkout changes; restart the TUI in either case.

## Next steps

- Install details and alternatives: [Installation](../deploy/installation.md).
- Settings and frontmatter reference: [Configuration reference](../admin/configuration.md).