# agents-skills

Reusable **agents**, **skills**, and **commands** for AI coding TUIs. Typeset as plain Markdown with a portable output convention so they render across `opencode`, Claude Code, Gemini CLI (pi), hermes, and other terminal assistants.

## Install

```sh
make install-opencode   # symlink agents/, skills/, commands/ and configs into ~/.config/opencode
make install-claude     # symlink skills/ into ~/.claude/skills
```

## Structure

| Directory | Description |
|---|---|
| `agents/` | Agent definitions (Markdown with YAML frontmatter: role, permissions, state machine, handoff format) |
| `skills/` | Skills (one subdirectory per skill with a `SKILL.md` entrypoint and optional `refs/`, `references/`, `languages/`, `infrastructure/`) |
| `commands/` | Slash-command definitions (Markdown prompt bodies with an optional YAML frontmatter: `description:`, `agent:`) |
| `plugins/` | Reserved for TUI plugins |
| `*.jsonc` | Sample opencode global/TUI configs (`opencode.jsonc`, `opencode_cfg.jsonc`, `tui_cfg.jsonc`) |

## Agents

| Agent | Mode | Description |
|---|---|---|
| `business-analyst` | primary | Refines software requests into approved, ready-to-create tickets |
| `system-analyst` | primary | Analyzes tickets against the codebase and presents implementation options for a decision |
| `coder` | primary | Implements an approved ticket from its requirements and selected direction, then verifies |
| `code-impact-explorer` | subagent | Read-only codebase discovery for the System Analyst |
| `ticket-context-reader` | subagent | Read-only ticket and discussion retrieval for the Business Analyst |
| `docs-glossary-reader` | subagent | Resolves a single unknown term from `docs/`, cached in `.ai-temp/` so terms are not re-searched each session |
| `docs-topic-reader` | subagent | Returns documented content relevant to one topic |
| `documenter` | primary | Generates or updates project documentation for any repository using the docs taxonomy and checks (typically Python/uv) |
| `researcher` | subagent | Searches the web for libraries, frameworks, tools, patterns, and technical solutions |

## Skills

| Directory | Description |
|---|---|
| `architecture-review/` | Staff-level codebase health review (monoliths, silent failures, type safety, test coverage, LLM friendliness) |
| `code-review/` | Review following personal engineering practices (security, performance, testing, design) |
| `commit/` | Safely stage and commit changes |
| `commit-message/` | Draft a structured commit message from uncommitted changes |
| `create_github_issue/` | Open a GitHub issue via `gh` |
| `debug/` | Investigate test failures and regressions, implement minimal fixes |
| `django-migration/` | Generate Django database migrations |
| `django-models/` | Design Django ORM models following silo/replication conventions |
| `documentation/` | Audit and fix the docs site for completeness and correctness |
| `find-bugs/` | Find bugs, security vulnerabilities, and quality issues in branch changes |
| `pull-request/` | Validate, commit, push, and open a PR with a Conventional description |
| `push/` | Stage, validate with tox, and push |
| `release/` | Generate release notes and create a GitHub release |
| `security/` | Orchestrated audit via security-audit + security-owasp |
| `security-audit/` | Threat-modeling audit (attack surfaces, secrets, SSRF, auth flaws) |
| `security-owasp/` | OWASP-based review, high-confidence findings only |
| `spec-inspect/` | Audit `.specs/` against existing codebase behavior |
| `spec-write/` | Interactive specification analysis and refinement loop |
| `testing-guidelines/` | Test writing guidance (integration tests, real fixtures, regression coverage) |
| `tox-fix/` | Run tox, fix failures, re-run until green |
| `upgrade/` | Audit and upgrade Python dependencies with uv/tox |

## Commands

| File | Description |
|---|---|
| `debug-code` | Debug failures/bugs with a root-cause fix loop |
| `devils-advocate` | Adversarial review of a proposal as a skeptical principal engineer |
| `eli5` | Explain a concept from first principles with one analogy |
| `humanize` | Rewrite text without corporate or AI markers |
| `init-project` | Create or update `AGENTS.md` and `.ai/*` files |
| `new-spec` | Create or refine a feature spec in `.specs/` |
| `step-by-step` | Deconstruct a task into an idempotent sequential plan |
| `truthmode` | Strict empirical rigor and epistemic calibration |
| `git-status` | Explain what the pending git changes are trying to do |

## Conventions

- Each skill MUST have a `SKILL.md` at its directory root.
- `SKILL.md` frontmatter uses `name:` and `description:` (required; description carries trigger keywords) plus optional `license:`, `compatibility:`, `metadata:`.
- Agents and commands use Markdown with YAML frontmatter; `description:` is required, and `agent`/`mode`/`permissions` are optional per-TUI settings.
- Every agent, skill, and command MUST follow the **TUI-portable output** standard (below) so reports render correctly in any terminal assistant.
- `.gitignore` excludes all dotfiles and editor backup files (`~*`).

## TUI-portable output

All generated output (handoffs, reviews, reports, commit messages, PR descriptions) must render across terminal-based AI TUIs (`opencode`, Claude Code, Gemini CLI, hermes, ...). Required:

- **Plain CommonMark only.** No raw HTML, no custom containers/admonitions, no Mermaid or ASCII diagrams.
- **ASCII-first charset.** No emoji, no box-drawing/arrow/dingbat glyphs. Prefer `--` over the em-dash character and `->` over the arrow character; use `*` / `-` bullets and `[x]` / `[ ]` checkboxes instead of Unicode list markers.
- **Headings** use ATX style (`## Title`); avoid setext (underlined) headings and a single `#` for section bodies.
- **Structure over layout.** Prefer headings, short bullets, and small tables. Keep lines under ~100 characters and tables narrow so they do not wrap in split panes.
- **Fenced code blocks** carry a language tag (e.g. `` ```python ``); avoid indented code blocks.
- **Self-contained output.** No relative links to repo files the reader may not have; inline the evidence (path:line) instead.
- **Literal special characters** must be escaped or placed in code spans so no TUI mis-parses them.

## No code

This repository contains no application code, tests, lint, typecheck, or CI. It is purely instruction definitions for coding agents.