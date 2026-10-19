# agents-skills documentation

This site documents **agents-skills**, a repository of reusable agents, skills,
and slash commands for the `opencode` terminal assistant. All definitions are
plain Markdown and all generated output follows the TUI-portable output
standard, so the text stays readable in any Markdown renderer.

The repository contains a small Node installer and tests, but no application
runtime, lint, typecheck, or CI (`AGENTS.md:133-135`). Its primary content is
instruction definitions for coding agents.

## Guides

| Guide | Audience | What it covers |
|---|---|---|
| [User Guide](user-guide/overview.md) | End users of the toolkit | What the agents, skills, and commands do, how to install and use them |
| [Administrative Guide](admin/configuration.md) | Operators and maintainers | Configuration, operations, security, troubleshooting |
| [Development Guide](development/setup.md) | Contributors | Repository structure, conventions, and full references |
| [Deploy Guide](deploy/installation.md) | Deployment owners | Installing the toolkit into a TUI and environment variables |

## Quick links

- [Getting started](user-guide/getting-started.md) -- first install and first run
- [Agent workflows](user-guide/workflows/agents.md) -- ticket pipeline
- [Agent reference](development/agents-reference.md) -- every agent
- [Skill reference](development/skills-reference.md) -- every skill
- [Plugin reference](development/plugins-reference.md) -- TypeScript plugins
- [Command reference](development/commands/debug-code.md) -- one page per command
- [Configuration reference](admin/configuration.md) -- settings and frontmatter
- [Environment variables](deploy/environment.md) -- variable names, never values
- [Glossary](glossary.md) -- one term per entry