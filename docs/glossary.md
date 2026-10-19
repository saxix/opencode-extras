# Glossary

One term per entry. Terms are linked from their first use on each page.

## Index

- [Agent](#agent)
- [AGENTS.md](#agentsmd)
- [Bookmark](#bookmark)
- [Command](#command)
- [Frontmatter](#frontmatter)
- [MCP](#mcp)
- [Primary agent](#primary-agent)
- [properdocs](#properdocs)
- [Skill](#skill)
- [SKILL.md](#skillmd)
- [Slash command](#slash-command)
- [Subagent](#subagent)
- [TUI](#tui)
- [TUI-portable output](#tui-portable-output)

## Agent

A reusable role definition for an AI coding assistant, stored under
`agents/` as Markdown with YAML frontmatter. Each agent has a purpose, a
description that carries trigger keywords, optional opencode settings
(`mode`, `color`, `steps`, `permissions`), and an operating contract
(`agents/business-analyst.md:74-85`). See the [agent reference](development/agents-reference.md).

## AGENTS.md

The project-level instruction file that every coding agent loads first. It
declares this repository's structure, conventions, and output standard
(`AGENTS.md:1`). The `init-project` command creates or updates it
(`commands/init-project.md`).

## Bookmark

A compact, named Markdown resume point for Business Analyst or System Analyst
ticket work. It is written only when the user explicitly asks, under the active
analyst's `.ai-temp/` directory, by the
[issue-bookmarks skill](development/skills-reference.md#issue_bookmarks); the same
skill lists and restores it. A bookmark is explicit scratch state, not an
autosave, transcript, or session backup. See
[Analyst bookmarks](development/agents-reference.md#analyst-bookmarks).

## Command

See [Slash command](#slash-command).

## Frontmatter

The YAML block at the top of a Markdown definition file, delimited by `---`
lines. Skills require `name:` and `description:`; agents and commands require
`description:` and may carry opencode settings such as `agent`, `mode`, `color`,
`steps`, and `permissions` (`AGENTS.md:97-99`). See the
[configuration reference](admin/configuration.md).

## MCP

Model Context Protocol. The ticketing integrations are declared as local MCP
servers in `opencode_cfg.jsonc` (`opencode_cfg.jsonc:21-34`), running
`uv run mcp-ticketing` against a project root given by `MCP_TICKETING_HOME`.
The Azure DevOps server is disabled by default; the GitHub server is enabled.

## Primary agent

An agent with `mode: primary` that runs directly in a TUI session and may
initiate work (for example `business-analyst`, `system-analyst`, `coder`,
`documenter`). See the [agent reference](development/agents-reference.md).

## properdocs

A Markdown static site generator for project documentation. It is the
preferred rendering tool for generated docs sites (`agents/documenter.md:60`)
and is configured with `properdocs.yml` / `properdocs.yaml` when a project
uses it. This documentation site is plain static Markdown configured by
`properdocs.yml`; when the renderer is available, its build supplements the
static checklist in the
[documentation skill](development/skills-reference.md#documentation).

## Skill

A specialized instruction bundle, stored as a directory under `skills/` with a
`SKILL.md` entrypoint and optional reference subdirectories. Skills are loaded
on demand when a task matches their description
(`skills/documentation/SKILL.md:3`). See the [skill reference](development/skills-reference.md).

## SKILL.md

The required entrypoint file of every skill. It uses `name:` and `description:`
frontmatter; the description carries the trigger keywords
(`AGENTS.md:97-98`).

## Slash command

A reusable prompt body stored under `commands/`, invoked by name in a TUI.
Commands may define `description:` and `agent:` frontmatter and receive user
input through `$ARGUMENTS` (for example `commands/devils-advocate.md`). When
`agent:` is omitted, the TUI can run it in the current session. See the
[command reference](development/commands/debug-code.md).

## Subagent

An agent with `mode: subagent` that runs as a bounded, delegated task from
another agent (for example `sub-code-impact-explorer`, `sub-ticket-context-reader`).
Most subagents are read-only and hidden (`agents/sub-code-impact-explorer.md:3`).

## TUI

Terminal User Interface. In this repository, the AI coding assistant that
loads the definitions and renders their Markdown output: `opencode`
(`README.md:3`).

## TUI-portable output

The output standard required of every agent, skill, and command in this
repository: plain CommonMark, ASCII-first charset, ATX headings, narrow tables,
fenced code blocks with language tags, self-contained evidence, no
TUI-specific directives (`AGENTS.md:118-131`). See the
[contribution guidelines](development/contribution.md).