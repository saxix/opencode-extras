# CLI Profile

Standalone command-line tool.

## Purpose

Document a CLI tool where installation, argument discovery, and copyable examples are critical.

## Required Guides

- **User Guide** — Overview & Key Features, Getting Started & Onboarding, Feature Workflows, Interface Navigation, **Installation**, **Arguments / Commands**, **Usage Examples**, FAQs & Troubleshooting.
- **Development Guide** — Local Environment Setup, Codebase Structure, Git Workflow & Branching, Testing Strategy (unit/integration for commands), CI/CD & Build Pipelines, Contribution Guidelines (how to add a new command/flag).
- **Excluded by default:** Administrative Guide, Deploy Guide (add only if the CLI has a service component).

## Mandatory Sections

1. **Installation** — prerequisites (OS, Python/Node version), all supported methods (`pipx`/`uv tool`/`pip`/`brew`/`docker`/`npm` only if configured in `pyproject.toml`/`package.json`/`Dockerfile`), verification (`--version` / `--help` / smoke run), upgrade/uninstall, troubleshooting. Every command executable.
2. **Arguments / Commands** — complete reference of commands, subcommands, arguments, flags/options, env vars and config keys: name, type, required/optional, default, allowed values, effect, dependencies/mutual exclusion. Source of truth: `argparse`/`click`/`typer`/`commander`/`yargs`/management commands. One page per command for rich CLIs.
3. **Usage Examples** — copyable and tested: happy path, at least 3-5 typical real invocations, edge cases/error handling. Each: prerequisites, exact command, expected output/exit code, where to read logs. Do not invent unexecuted examples.
4. **Development (Contributing)** — local setup, codebase structure relevant to the CLI, branch workflow, style/lint, test strategy, how to add a new command/flag, CI/CD.

Flag any missing Installation, Arguments, Usage Examples, or Development page as High gap.

## Evidence Sources

- `pyproject.toml` `[project.scripts]` / `[project.entry-points]`, `package.json` `bin`, `Dockerfile`.
- `argparse`/`click`/`typer`/`commander`/`yargs` definitions, management commands.
- `README*`, `tests/` for commands.

## Verification Checklist

- Every argument/flag exists in code with correct type/default.
- Every install command is runnable and matches `pyproject.toml`/`package.json`.
- Every usage example was executed (or marked as requiring credentials/network with a dry-run alternative).

## Example Structure

```
docs/
  user-guide/
    installation.md
    commands/
      mytool-run.md
      mytool-config.md
    usage-examples.md
  development-guide/
    contributing.md
```
