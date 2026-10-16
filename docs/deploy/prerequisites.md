# Prerequisites and infrastructure

Who is this for? This page lists what you need before installing the toolkit.

## Required

| Prerequisite | Purpose |
|---|---|
| `Node.js 18+` + `npx` | Installer and tests (`package.json:10`, `tests/install.test.mjs:1`) |
| Unix-like shell (`bash`) | Running the Node installer and tests |
| `git` | Cloning and updating the repository |
| An AI coding TUI | Consuming the definitions (opencode, Claude Code, Codex, pi; all support `npx opencode-extras`) |

## Optional

| Prerequisite | Purpose |
|---|---|
| `uv` | Running the ticketing MCP servers (`uv run mcp-ticketing`, `src/~opencode_cfg.jsonc:24`) |
| `mcp-ticketing` project | Located at `MCP_TICKETING_HOME`; provides the MCP server binary |
| Ticketing credentials | For the MCP servers (see [Environment variables](environment.md)) |
| `properdocs` | Optional render tool if you want to build the docs site; no build configuration is shipped (see [Operations](../admin/operations.md)) |

## Infrastructure notes

- No server, database, or network service is required for the definitions
  themselves; the toolkit is configuration-only
  ([Architecture](architecture.md)).
- The GitHub and Redmine MCP servers are enabled by default; the Azure DevOps
  one is disabled (`opencode_cfg.jsonc:22-33`).
- Credentials live in the local, git-ignored `.envrc` file and are loaded into
  the environment by your shell setup (for example direnv). Values must never
  be committed or documented.

## Next steps

- Perform the install: [Installation](installation.md).
- Configure credentials: [Environment variables](environment.md).
