# Interface navigation

Who is this for? This page describes where agents, skills, and commands live
once installed in opencode.

## Where definitions live

The repository is the source of truth. The installer copies definitions by
default; `--link` creates live symlinks to a local checkout.

| Scope | Destination |
|---|---|
| Global (default) | `~/.config/opencode` |
| Project (`--project`) | `./.opencode` |

There is no target selector: opencode is the only target (`--agent` was
removed).

The root-level `opencode.jsonc` in the repository is a project-scope sample and
is not installed by the installer (`opencode.jsonc`).

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

## Configurations

Agents, skills, and commands are opencode definitions; the installer writes
only the opencode layout. The definitions are plain Markdown, so the text
remains readable outside opencode, but no other assistant is a supported
install target.

## After any change

Copy installations update when the installer is rerun. Linked installations
update when the checkout changes; restart the TUI in either case.

## Next steps

- Install details and alternatives: Installation.
- Settings and frontmatter reference: Configuration reference.