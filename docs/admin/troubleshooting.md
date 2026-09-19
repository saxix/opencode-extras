# Troubleshooting (administrative)

Who is this for? This page is for operators maintaining the toolkit and the
TUI configuration. End-user questions are in the
[User Guide FAQ](../user-guide/faq.md).

## Config file is invalid and the TUI refuses to start

opencode validates its config strictly at startup. Escape hatches let you
start without the broken project config:

| Variable | Effect |
|---|---|
| `OPENCODE_DISABLE_PROJECT_CONFIG=1` | Skip the project's local config, start from globals only |
| `OPENCODE_CONFIG=/path/to/file.json` | Load an explicit additional config |
| `OPENCODE_CONFIG_CONTENT='...'` | Inject inline JSON as a final overlay |
| `OPENCODE_DISABLE_DEFAULT_PLUGINS=1` | Skip default plugins |
| `OPENCODE_PURE=1` | Skip external plugins entirely |

Fix the offending file, then restart without the variable. This behavior is
opencode-specific; other TUIs have their own rescue flags.

## Changes are not picked up

The TUI loads config once at startup and does not hot-reload. Quit and
restart after any change to `agents/`, `skills/`, `commands/`, or the
`*.jsonc` configs.

## A skill or agent is loaded but misbehaves after an edit

Check frontmatter validity first: missing `name:`/`description:` in a skill
filters it out; an unknown agent field is silently routed into per-TUI
options. Then verify the file still follows the TUI-portable output standard
(`AGENTS.md:85-98`) and restart.

## MCP ticketing server fails to start

The installer enables no MCP server. If you configured one separately, verify its actual
command, environment, credentials, and selected ticketing project using its documentation.
Checkout `references` do not start servers. Without an integration, the analysts can use
pasted ticket text and prepare provider-neutral drafts.

## `make install-opencode` complains about an existing path

Installers refuse existing conflicting directories or links. Inspect the path, preserve
user definitions, and decide whether to merge definitions or relocate the old installation.
Do not delete an existing real directory merely to make the installer succeed. On Windows,
use the PowerShell global/local installer; the Windows Make install target delegates to global mode.

## A stale editor backup is mistaken for a definition

Files ending in `~` are editor backups and are git-ignored (`.gitignore:1`);
for example `spec.md~` and `commands/~spec-inspect.~md`. Only `*.md` files
without the trailing `~` are definitions.

## Next steps

- Security posture: [Security and compliance](security.md).
- Manual install and removal: [Deploy guide](../deploy/installation.md).