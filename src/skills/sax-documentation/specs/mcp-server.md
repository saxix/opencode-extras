# MCP Server Profile

MCP Server = CLI + MCP interface (tools/resources/prompts over stdio/SSE).

## Purpose

Document an MCP Server where transport, tool schemas, and client configuration are critical in addition to CLI coverage.

## Required Guides

- **User Guide** -- Overview & Key Features, Getting Started & Onboarding, Feature Workflows, Interface Navigation, **Installation**, **Arguments / Commands**, **Tools / Resources / Prompts**, **Transport**, **Usage Examples**, FAQs & Troubleshooting.
- **Development Guide** -- Local Environment Setup, Codebase Structure (CLI + MCP layer), Git Workflow & Branching, Testing Strategy (unit/integration for commands/tools), CI/CD & Build Pipelines, Contribution Guidelines (how to add a new tool/resource/prompt).
- **Excluded by default:** Administrative Guide, Deploy Guide (add only if the MCP Server has a service component).

## Mandatory Sections

1. **Installation** -- prerequisites (OS, Python/Node version), all supported methods (`pipx`/`uv tool`/`pip`/`brew`/`docker`/`npm` only if configured), verification (`--version` / `--help` / smoke run), upgrade/uninstall, troubleshooting. Every command executable.
2. **Arguments / Commands** -- complete reference of CLI commands, subcommands, arguments, flags/options, env vars and config keys. Source of truth: `argparse`/`click`/`typer`/`commander`/`yargs`/management commands. One page per command for rich CLIs.
3. **Tools / Resources / Prompts** -- for each MCP tool: name, description, input schema (JSON Schema), output schema, example payload, error cases. For resources/prompts: URI, description, schema. Source of truth: MCP server definitions (`tools`/`resources`/`prompts` registration, `mcp` config in `opencode.json` or `properdocs.yml`).
4. **Transport** -- supported transports (`stdio` / `SSE` / `streamable-http`), how to configure the client (e.g., Claude Desktop `claude.json`, MCP Inspector), example client config snippet, how to verify the connection (logs, `mcp` inspector).
5. **Usage Examples** -- copyable and tested: happy path, at least 3-5 typical real invocations including one end-to-end flow (client config + tool call + expected response). Each: prerequisites, exact command, expected output/exit code, where to read logs. Do not invent unexecuted examples.
6. **Development (Contributing)** -- local setup, codebase structure relevant to the CLI/MCP, branch workflow, style/lint, test strategy, how to add a new command/flag/tool, CI/CD.

Flag any missing Installation, Arguments, Tools, Transport, Usage Examples, or Development page as High gap.

## Evidence Sources

- `pyproject.toml` `[project.scripts]` / MCP `tools`/`resources`/`prompts` definitions, `mcp` server config (`opencode.json` `mcp`, `properdocs.yml`).
- `Dockerfile`, `package.json` `bin`, CLI definitions.
- `README*`, `tests/` for tools.

## Verification Checklist

- Every tool/resource/prompt exists in code with correct input/output schema.
- Every argument/flag exists in code with correct type/default.
- Every install command and client config snippet is runnable and matches `pyproject.toml`/`mcp` config.
- Every usage example was executed (or marked as requiring credentials/network with a dry-run alternative).

## Example Structure

```
docs/
  user-guide/
    installation.md
    commands.md
    tools/
      mytool-search.md
    transport.md
    usage-examples.md
  development-guide/
    contributing.md
```
