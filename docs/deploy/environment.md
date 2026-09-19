# Environment and optional integrations

The definitions and Windows installer require no credentials, Python environment, or ticketing
server. Configure model providers in the existing OpenCode user/workspace configuration.
The installer does not change these settings or enable MCP servers.

## Project environments

Resolve each target project's runner, Python environment, settings, database, and required
variables from its own instructions and configuration. Do not assume `.envrc`, direnv, uv,
or one environment for the whole workspace. On Windows use the project's documented
PowerShell-compatible setup.

## Optional ticketing

Business and System Analysts accept supplied ticket text and can prepare provider-neutral
drafts without an integration. To retrieve or create tickets through tools, configure a
supported MCP server or adapter separately using its own documentation.

Provider credentials and target project/repository selection belong to that integration.
In a multi-repo session, confirm the ticketing target rather than reusing a previous project's
owner, repository, or board by assumption. OpenCode MCP `environment` values can refer to
`{env:VARIABLE_NAME}`; the variable must actually be available to the server process.

The checkout's `references` are source-code references, not running MCP servers. No default
GitHub or Azure DevOps server is supplied. Do not infer server commands or credential names
from obsolete configuration examples.

## Secret handling

Keep credentials outside tracked definitions and reports. A toolkit `.gitignore` does not
protect files in its parent workspace or other repositories. Use each project's existing
credential mechanism, and document variable names or redacted examples rather than values.

See [Configuration](../admin/configuration.md), [Troubleshooting](../admin/troubleshooting.md),
and [Prerequisites](prerequisites.md).
