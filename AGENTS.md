# agents-skills

Reusable agents, skills, and commands for AI coding TUIs. All definitions are plain Markdown and all generated output follows the TUI-portable standard in this file, so they render correctly in `opencode`, Claude Code, Codex, pi, Gemini CLI, hermes, and other terminal assistants.

## Install

Via `npx` (copy per-item, coexistence-safe):

```sh
npx opencode-utils                              # global opencode (default)
npx opencode-utils --project                    # project opencode
npx opencode-utils --agent claude --global      # global claude
npx opencode-utils --agent codex --project      # project codex
npx opencode-utils --agent pi --global          # global pi
npx opencode-utils --agent compat               # project .agents layout
npx opencode-utils --agent opencode --link      # global live symlinks
npx opencode-utils --help
```

Default is `--copy` per-item (safe with other skill packs). Use `--link` for live dev. Use `--agent compat` for the project `.agents` layout.

## Structure

| Directory | Description |
|---|---|
| `agents/` | Agent definitions (Markdown with YAML frontmatter; `description:` required) |
| `skills/` | Skills (one subdirectory per skill with a `SKILL.md` entrypoint and optional reference docs) |
| `commands/` | Slash-command definitions (Markdown prompt bodies with an optional YAML frontmatter: `description:`, `agent:`) |
| `plugins/` | Reserved for TUI plugins |
| `*.jsonc` | Sample opencode global and TUI configs (`opencode.jsonc`, `opencode_cfg.jsonc`, `tui_cfg.jsonc`) |

## Agents

| Agent | Mode | Description |
|---|---|---|
| `business-analyst` | primary | Refines software requests into approved, ready-to-create tickets |
| `system-analyst` | primary | Analyzes tickets against the codebase and presents implementation options for a decision |
| `coder` | primary | Implements an approved ticket from its requirements and selected direction, then verifies |
| `sub-code-impact-explorer` | subagent | Read-only codebase discovery for the System Analyst |
| `sub-ticket-context-reader` | subagent | Read-only ticket and discussion retrieval for the Business Analyst |
| `sub-docs-glossary-reader` | subagent | Resolves a single unknown term from `docs/` with a minimal, capped report |
| `sub-docs-topic-reader` | subagent | Returns documented content relevant to one topic |
| `sub-universal-code-reviewer` | subagent | Reviews code across languages for bugs, security, performance, and maintainability |
| `documenter` | primary | Generates or updates documentation for any repository using the docs taxonomy and checks (typically Python/uv) |
| `sub-researcher` | subagent | Searches the web for libraries, frameworks, tools, patterns, and technical solutions |

## Skills

| Directory | Description |
|---|---|
| `architecture-review/` | Staff-level codebase health review |
| `code-review-django/` | Code review following personal engineering practices (Django stack) |
| `code-review-python/` | Python idioms, PEP 8, type hints and modern Python review |
| `commit/` | Safely stage and commit changes |
| `commit-message/` | Draft a structured commit message |
| `create_github_issue/` | Open a GitHub issue via `gh` |
| `debug/` | Investigate failures, implement minimal fixes |
| `django-migration/` | Django migration generation |
| `django-models/` | Django ORM model design |
| `documentation/` | Canonical docs site taxonomy, audit clauses, style, and build checks (loaded by `documenter`; triggered standalone for audits) |
| `find-bugs/` | Bug and vulnerability finding |
| `pull-request/` | Validate, commit, push, and open a PR |
| `push/` | Stage, validate with tox, and push |
| `release/` | Generate release notes and a GitHub release |
| `security/` | Orchestrated security audit |
| `security-audit/` | Threat-modeling security audit |
| `security-owasp/` | OWASP-based security review |
| `spec-inspect/` | Audit `.specs/` against codebase behavior |
| `spec-write/` | Interactive specification refinement |
| `testing-guidelines/` | Testing patterns and guidance |
| `ticket-writing/` | Canonical ticket content rules shared by Business Analyst and System Analyst (title, prefixes, soft-wrap, diagrams, language) |
| `tox-fix/` | Run tox, fix failures, re-run until green |
| `upgrade/` | Dependency upgrade checker |

## Commands

| File | Description |
|---|---|
| `debug-code` | Debug failures/bugs with a root-cause fix loop |
| `devils-advocate` | Adversarial review of a proposal |
| `eli5` | Explain a concept from first principles |
| `humanize` | Rewrite text without corporate or AI markers |
| `init-project` | Create or update `AGENTS.md` and `.ai/*` files |
| `new-spec` | Create or refine a feature spec in `.specs/` |
| `step-by-step` | Deconstruct a task into an idempotent sequential plan |
| `truthmode` | Strict empirical rigor and epistemic calibration |
| `git-status` | Explain what pending changes are trying to do |
| `issue-save` | Save the active analyst's current work as a named compact bookmark |
| `issue-load` | Load a named bookmark for the active analyst |
| `issue-list` | List bookmarks belonging to the active analyst |

## Git workflow

- Do not create or use branches in this project.
- Work directly on `main` and commit changes there.

## Conventions

- Each skill MUST have a `SKILL.md` at its directory root.
- `SKILL.md` frontmatter uses `name:` and `description:` (required; the description carries trigger keywords) plus optional `license:`, `compatibility:`, `metadata:` keys.
- Agents and commands use Markdown with YAML frontmatter; `description:` is required, and `agent`, `mode`, `color`, `steps`, `permissions` are optional per-TUI settings that other TUIs ignore.
- Reference materials live alongside `SKILL.md` in named subdirectories (no enforced convention).
- `.gitignore` excludes all dotfiles and editor backup files (`~*`); only `.gitignore` itself is kept among dotfiles.
- `.ai-temp/` is git-ignored agent scratch, never a deliverable. The `Business
  Analyst` and `System Analyst` persist compact resume state only when the user
  explicitly invokes `issue-save`, using `.ai-temp/business-analyst/<name>.md`
  and `.ai-temp/system-analyst/<name>.md` respectively. The matching `issue-load`
  and `issue-list` commands operate only in the active analyst role. There is no
  autosave, fixed analyst snapshot, migration, or natural-language save/resume
  trigger. The business-analyst separately maintains
  `.ai-temp/glossary-known-terms.yaml` as an accumulating project glossary of
  terms resolved from `docs/`, shared across sessions as a fallback when the
  documentation has no structured glossary.
- Every agent, skill, and command MUST emit output that follows the TUI-portable standard below.
- The `documenter` agent generates or updates documentation (operator role: gates, permissions, workflow); the `documentation` skill owns the domain knowledge (four-guide taxonomy, audit clauses, style, build checks, findings template) and is shared by `documenter`, standalone audits, and any future docs agent. Rules live in only one place: the skill.
- The `ticket-writing` skill owns the canonical ticket content rules (title, prefixes, body, soft-wrap, diagrams, language) shared by the `Business Analyst` and the `System Analyst`. Rules live in only one place: the skill; agents must load it rather than re-implementing its rules.

## TUI-portable output

All generated output (handoffs, reviews, reports, commit messages, PR descriptions, replies) MUST render correctly in every common terminal-based AI TUI: `opencode`, Claude Code, Gemini CLI, hermes, and similar Markdown renderers. Concretely:

- **Plain CommonMark only.** Use standard Markdown. No raw HTML, no custom containers or admonitions. When the user asks for a diagram or chart, use Mermaid fenced code blocks (`` ```mermaid ``); otherwise, no diagrams. When a Mermaid diagram appears inside a ticket body, use the same language as the ticket.
- **ASCII-first charset.** Do not emit emoji, box-drawing glyphs, arrows, dingbats, or other non-ASCII list markers. Prefer `--` over the em-dash character and `->` over the arrow character; use `*`, `-`, `[ ]`, `[x]` for lists and checkboxes.
- **ATX headings.** Use `#`-style headings (`##`, `###`, ...). Avoid setext (underlined) headings and avoid a lone `#` for section bodies.
- **Structure over layout.** Favor headings, short bullets, and small, narrow tables over wide layout so lines stay under about 100 characters and do not wrap badly in split panes.
- **Fenced code blocks** with a language tag (`` ```python ``). Avoid indented code blocks. Fence-example formats that another TUI could mis-parse are not allowed.
- **Self-contained evidence.** Inline evidence (`path/to/file:line`) in prose rather than relying on relative links to repository files the reader may not have open.
- **Literal special characters** that could be parsed as formatting (`<`, `>`, `*`, quotes around emphasis) are escaped or placed in code spans.
- **No TUI-specific directives.** Do not emit tool-call syntax, slash-command references, or keybind hints meant for a single TUI.

When a skills or agent file prescribes an output template, that template is governed by this standard; authors may update templates to match.

## No code

This repository contains a small Node installer and tests, but no application runtime, lint, typecheck, or CI. Its primary content is instruction definitions for coding agents.