# Environment variables

Who is this for? This page lists the runtime variables the toolkit's optional
integrations use. It is the source of truth for these variable **names**;
values are per-machine secrets and are never documented here.

## Source

The variables are declared locally in `.envrc`, which is git-ignored and
provides a direnv-style environment (`git check-ignore .envrc` matches
`.gitignore:2`). Load them with your shell setup (for example direnv) or by
exporting them manually. Never commit this file.

## Variable reference

| Variable | Required by | Purpose |
|---|---|---|
| `MCP_TICKETING_HOME` | both MCP servers | Project root holding the `mcp-ticketing` package; used as the server `cwd` (`opencode_cfg.jsonc:24`) |
| `MCP_AZURE_DEVOPS_ORG` | azure-devops server | Azure DevOps organization |
| `MCP_AZURE_DEVOPS_PROJECT` | azure-devops server | Azure DevOps project |
| `MCP_AZDO_PAT` | azure-devops server | Azure DevOps personal access token (secret) |
| `MCP_GITHUB_OWNER` | github server | GitHub owner for the ticketing repository |
| `MCP_GITHUB_REPO` | github server | GitHub repository for the ticketing integration |
| `MCP_GITHUB_TOKEN` | github server | GitHub personal access token (secret) |
| `MCP_REDMINE_URL` | redmine server | Redmine instance base URL |
| `MCP_REDMINE_PROJECT` | redmine server | Redmine project identifier or ID (default scope) |
| `MCP_REDMINE_API_KEY` | redmine server | Redmine API key (secret) |
| `MCP_REDMINE_VERSION` | redmine server | Optional. Declared Redmine version (e.g. `4.2`, `6.1`, `7.0`); supported 4.2 - 7.x. Never auto-detected: declare your server version. When empty the latest profile (7.x) is used |

Evidence: `.envrc` export lines; server wiring in `opencode_cfg.jsonc:21-34`.

## Per-project configuration

Each project must define `MCP_GITHUB_OWNER`, `MCP_GITHUB_REPO`, and
`MCP_GITHUB_TOKEN` (and, for Redmine, `MCP_REDMINE_URL`, `MCP_REDMINE_PROJECT`,
`MCP_REDMINE_API_KEY`) in its own `.envrc` file. The MCP server configuration
uses the `environment` field to pass these values to the server process,
overriding the defaults from `MCP_TICKETING_HOME/.envrc`.

```bash
# Project .envrc
export MCP_GITHUB_OWNER=my-org
export MCP_GITHUB_REPO=my-repo
export MCP_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

export MCP_REDMINE_URL=https://redmine.example.com
export MCP_REDMINE_PROJECT=myproject
export MCP_REDMINE_API_KEY=xxxxxxxxxxxxxxxx
```

The MCP configuration reads these via `{env:VAR}` syntax:

```jsonc
"environment": {
  "MCP_GITHUB_OWNER": "{env:MCP_GITHUB_OWNER}",
  "MCP_GITHUB_REPO": "{env:MCP_GITHUB_REPO}",
  "MCP_GITHUB_TOKEN": "{env:MCP_GITHUB_TOKEN}"
}
```

See [Configuration reference](../admin/configuration.md#mcp-environment-overrides)
for the full MCP configuration format.

## Server status

The `github` and `redmine` servers are enabled by default; `azure-devops` is
disabled (`opencode_cfg.jsonc:22-33`). To use Azure DevOps, enable the server
block and provide its three variables. The server command form is
`uv run mcp-ticketing <provider>` run from `MCP_TICKETING_HOME`
(`opencode_cfg.jsonc:24-25`).

## Security

- Values are secrets and must never be written to documentation, commits, or
  issue reports; only names are documented here.
- If a token appears in any output, rotate it immediately.
- The `.envrc` file stays local and untracked
  ([Security and compliance](../admin/security.md)).

## Next steps

- Server troubleshooting: [Administrative troubleshooting](../admin/troubleshooting.md).
- Infrastructure requirements: [Prerequisites](prerequisites.md).