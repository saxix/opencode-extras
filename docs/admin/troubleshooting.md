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
(`AGENTS.md:118-131`) and restart.

## MCP ticketing server fails to start

The GitHub MCP server is enabled, Azure DevOps disabled by default
(`opencode_cfg.jsonc:21-34`). The server command runs `uv run mcp-ticketing`
with `cwd` set from `{env:MCP_TICKETING_HOME}`. If it fails:

1. Confirm `MCP_TICKETING_HOME` points at the mcp-ticketing project
   (`.envrc`).
2. Confirm the provider credentials are exported (names and roles in
   [Environment variables](../deploy/environment.md)); the Azure DevOps server
   additionally needs `MCP_AZURE_DEVOPS_ORG` and `MCP_AZURE_DEVOPS_PROJECT`.
3. Check the repo has a `uv` virtualenv with `mcp-ticketing` installed.

## An install target complains about an existing path

The default installer copies definitions per item. If a linked installation
reports a conflict at the destination, remove the stale real directory or
symlink, then rerun the command with `--link`. For example:

```sh
npx opencode-utils --agent opencode --global
```

The same applies to project installs; use `--agent compat --project` for the
`.agents` layout.

## A stale editor backup is mistaken for a definition

Files ending in `~` are editor backups and are git-ignored (`.gitignore:1`);
for example `spec.md~` and `commands/~spec-inspect.~md`. Only `*.md` files
without the trailing `~` are definitions.

## Next steps

- Security posture: [Security and compliance](security.md).
- Manual install and removal: [Deploy guide](../deploy/installation.md).