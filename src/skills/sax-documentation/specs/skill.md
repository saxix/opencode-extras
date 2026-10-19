# Skill Profile

Agent skill or skill pack (e.g., `agents-skills` with `agents/`, `skills/`, `commands/`).

## Purpose

Document a skill that extends an AI coding agent. Optimize for installation via package manager and frontmatter correctness.

## Required Guides

- **User Guide** -- Overview & Key Features, Getting Started & Onboarding, **Installation**, **Skill Structure**, **Available Skills** (or single skill detail), FAQs & Troubleshooting.
- **Development Guide** -- Local Environment Setup, Codebase Structure (`agents/`, `skills/`, `commands/`), Git Workflow & Branching, Testing Strategy, CI/CD & Build Pipelines, Contribution Guidelines (how to add a new skill/agent/command).
- **Excluded by default:** Administrative Guide, Deploy Guide.

## Mandatory Sections

1. **Installation** -- methods via `npx` (e.g., `npx opencode-extras`, `npx opencode-extras --project`, `npx opencode-extras --agent <target>`, `--copy`/`--link`), verification (skill appears under `~/.config/opencode/skills/` or `.opencode/skills/`), upgrade/uninstall, troubleshooting. Every command executable.
2. **Skill Structure** -- directory layout (`agents/`, `skills/<name>/SKILL.md`, `commands/`, `plugins/`), frontmatter rules (`name`, `description` required, `license`/`compatibility`/`metadata` optional), coexistence-safe per-item install.
3. **Available Skills / Skill Detail** -- for a pack: table of skills with `name` and description; for a single skill: frontmatter, trigger keywords, body, and `refs/` if present.
4. **Development (Contributing)** -- local setup, how to add a new skill (one subdirectory per skill with `SKILL.md`), style (TUI-portable output), testing (`node --test`), release.

Flag any missing Installation, Skill Structure, or Available Skills page as High gap.

## Evidence Sources

- `src/skills/<name>/SKILL.md` frontmatter (`name`, `description`).
- `src/agents/*.md`, `src/commands/*.md`, `package.json` `bin` (`opencode-extras`), `scripts/install.mjs`.
- `README.md`, `AGENTS.md`, `.pages` under `docs/`.

## Verification Checklist

- Every skill directory has a `SKILL.md` with valid `name` and `description`; description contains trigger keywords.
- Every install command is runnable and matches `package.json` and `scripts/install.mjs`.
- Skill table in docs matches `src/skills/*` and `src/agents/*`.

## Example Structure

```
docs/
  user-guide/
    getting-started.md
    installation.md
    skill-structure.md
    available-skills.md
  development-guide/
    local-setup.md
    adding-a-skill.md
```
