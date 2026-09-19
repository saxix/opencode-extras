# agents-skills

Reusable **agents**, **skills**, and **commands** for AI coding TUIs. Typeset as plain Markdown with a portable output convention so they render across `opencode`, Claude Code, Gemini CLI (pi), hermes, and other terminal assistants.

## Install

Choose a global install for use from any individual project, or a local install for one
project or multi-repository workspace. From this checkout on Windows:

```powershell
.\scripts\install-opencode.ps1 -Global -WhatIf
.\scripts\install-opencode.ps1 -Global
# Alternative: local installation in an existing project/workspace
.\scripts\install-opencode.ps1 -WorkspaceRoot 'C:\work\projects'
```

The installer creates junctions for agents, skills, commands, and optional shared instructions.
Global installs use the user's OpenCode config directory; local installs use `.opencode/`.
Existing conflicting content is never overwritten. To use shared operating defaults, add
the installed `instructions/workspace.md` path to your config's `instructions` array.
No report directory, language, or prompt logging is imposed. These policies and any extra
agent permissions belong in the project/workspace configuration, not the toolkit definitions.
The old `install-workspace.ps1 -WorkspaceRoot ...` entrypoint remains supported.
Restart OpenCode after changes.
See `docs/deploy/installation.md` and `docs/user-guide/workspace.md` for details.

On Unix, `make install-opencode` (or `make install`) links definitions globally under
`~/.config/opencode`; `make install-claude` links skills under `~/.claude/skills`.
Neither target installs provider, model, TUI, or MCP configuration. On Windows,
`make install-opencode` also delegates to the global PowerShell installer when Make is available.

## Structure

| Directory | Description |
|---|---|
| `src/agents/` | Agent roles, permissions, workflows, and handoffs |
| `src/skills/` | Skills with `SKILL.md` entrypoints and optional reference materials |
| `src/commands/` | Reusable command prompts |
| `src/instructions/` | Shared workspace operating rules |
| `scripts/` | Windows installer and installation smoke test |
| `opencode.jsonc` | Configuration for this toolkit checkout; not an installed user config |

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
| `documenter` | primary | Generates or updates documentation using the existing project's tools |
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
| `django-models/` | Design ORM models using the target project's Django version and conventions |
| `documentation/` | Audit and fix the docs site for completeness and correctness |
| `find-bugs/` | Find bugs, security vulnerabilities, and quality issues in branch changes |
| `pull-request/` | Validate, commit, push, and open a PR with a Conventional description |
| `push/` | Stage intended files, validate with project tools, and push when requested |
| `release/` | Generate release notes and create a GitHub release |
| `security/` | Orchestrated audit via security-audit + security-owasp |
| `security-audit/` | Threat-modeling audit (attack surfaces, secrets, SSRF, auth flaws) |
| `security-owasp/` | OWASP-based review, high-confidence findings only |
| `spec-inspect/` | Audit `.specs/` against existing codebase behavior |
| `spec-write/` | Interactive specification analysis and refinement loop |
| `testing-guidelines/` | Test writing guidance (integration tests, real fixtures, regression coverage) |
| `ticket-writing/` | Canonical ticket content rules shared by the analysts (title, prefixes, soft-wrap, diagrams, language) |
| `tox-fix/` | Run tox, fix failures, re-run until green |
| `upgrade/` | Audit and upgrade dependencies with the existing project manager and checks |

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
- Agents and commands use Markdown with YAML frontmatter; `description:` is required.
  OpenCode agents use `permission` (singular), with `edit`, `bash`, and `task` tool rules.
- Shared instructions define multi-repo scope and per-project environments. Analyst snapshots
  are separated by repository and activity; final reports follow workspace conventions.
- Every agent, skill, and command MUST follow the **TUI-portable output** standard (below) so reports render correctly in any terminal assistant.
- `.gitignore` excludes all dotfiles and editor backup files (`~*`).

## TUI-portable output

All generated output (handoffs, reviews, reports, commit messages, PR descriptions) must render across terminal-based AI TUIs (`opencode`, Claude Code, Gemini CLI, hermes, ...). Required:

- **Plain CommonMark only.** No raw HTML, no custom containers/admonitions. Use Mermaid fenced code blocks (`` ```mermaid ``) only when the user asks for a diagram or chart. When a Mermaid diagram appears inside a ticket body, use the same language as the ticket.
- **ASCII-first charset.** No emoji, no box-drawing/arrow/dingbat glyphs. Prefer `--` over the em-dash character and `->` over the arrow character; use `*` / `-` bullets and `[x]` / `[ ]` checkboxes instead of Unicode list markers.
- **Headings** use ATX style (`## Title`); avoid setext (underlined) headings and a single `#` for section bodies.
- **Structure over layout.** Prefer headings, short bullets, and small tables. Keep lines under ~100 characters and tables narrow so they do not wrap in split panes.
- **Fenced code blocks** carry a language tag (e.g. `` ```python ``); avoid indented code blocks.
- **Self-contained output.** No relative links to repo files the reader may not have; inline the evidence (path:line) instead.
- **Literal special characters** must be escaped or placed in code spans so no TUI mis-parses them.

## Verification

There is no application code or application test suite. Definitions are checked through the
OpenCode loader and static review. The Windows installer has a focused smoke test:

```powershell
.\scripts\test-workspace-install.ps1
.\scripts\test-opencode-loader.ps1
```

The installer test exercises dry-run, paths with spaces, repeat installation, configuration
preservation, and conflicts. The loader test uses isolated local/global configuration to verify
standalone, multi-repository, and local-policy behavior. See `docs/development/testing.md`.