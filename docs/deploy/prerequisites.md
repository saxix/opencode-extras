# Prerequisites and infrastructure

Who is this for? This page lists what you need before installing the toolkit.

## Required

| Prerequisite | Purpose |
|---|---|
| PowerShell 5.1+ on Windows | Global/local installer and smoke test; junction-capable filesystem |
| Shell and GNU Make on Unix | Global install targets and Unix smoke test |
| `git` | Cloning and updating the repository |
| An AI coding TUI | Consuming the definitions (opencode recommended; Claude Code for skills) |

## Optional

| Prerequisite | Purpose |
|---|---|
| Project package manager | Only for target project tasks or separately configured integrations |
| Ticketing adapter / MCP server | Optional retrieval and ticket creation; configure separately |
| Ticketing credentials | For the MCP servers (see [Environment variables](environment.md)) |
| `properdocs` | Optional render tool if you want to build the docs site; no build configuration is shipped (see [Operations](../admin/operations.md)) |

## Infrastructure notes

- No server, database, or network service is required for the definitions
  themselves; the toolkit is configuration-only
  ([Architecture](architecture.md)).
- No MCP server is enabled by the toolkit installer.
- Use the environment and credential mechanism actually configured for each project.
  Do not assume `.envrc` or direnv on Windows; never commit credentials.

## Next steps

- Perform the install: [Installation](installation.md).
- Configure credentials: [Environment variables](environment.md).