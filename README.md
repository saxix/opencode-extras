# agents-skills

Reusable **agents**, **skills**, and **commands** for AI coding TUIs. Typeset as plain Markdown with a portable output convention so they render across `opencode`, Claude Code, Gemini CLI (pi), hermes, and other terminal assistants.

## Install

Via `npx` (copy per-item, coexistence-safe, no directory symlink):

```sh
npx opencode-utils --global --all              # global ~/.config/opencode/skills/sax-* + ~/.claude/skills/sax-* + ~/.codex/skills/sax-*
npx opencode-utils --project --all             # project ./.opencode/skills/sax-* + ./.claude/skills/sax-* + ./.codex/skills/sax-*
npx opencode-utils --global --opencode         # only opencode
npx opencode-utils --global --claude           # only claude
npx opencode-utils --global --codex            # only codex
npx opencode-utils --project --link --all      # dev live symlinks (opt-in)
npx opencode-utils --project --compat          # project compat ./.agents/skills/sax-* (instead of dedicated folders)

# preview / remove
npx opencode-utils --dry-run --global --all
npx opencode-utils --uninstall --global --all
```

Skills are installed with prefix `sax-` (`DEST/skills/sax-<name>`) to avoid collisions; agents/commands are per-item, coexistence-safe.

#### Install from a local clone (dev with --link)

```sh
git clone https://github.com/saxix/opencode-utils.git
cd opencode-utils
# install this clone into itself as project (live symlinks)
node ./scripts/install.mjs --project --link --all
# install this clone into another project
cd /path/to/your/project
node /path/to/opencode-utils/scripts/install.mjs --project --link --all
# compat variant (single .agents)
node /path/to/opencode-utils/scripts/install.mjs --project --compat --link
# preview / verify
ls -l .opencode/skills/sax-security            # symlink -> src/skills/security
ls -l .agents/skills/sax-security              # compat
readlink .opencode/skills/sax-security
```

Via `make` (wrapper to `npx`):

```sh
make install              # global --all (copy)
make install-project      # project --all (copy)
make install-opencode     # global opencode only
make install-claude       # global claude only
make install-codex        # global codex only
make install-all          # global opencode+claude+codex
make help                 # show npx help
make uninstall            # remove global --all
```

Default is `--copy` per-item (safe with other skill packs). Use `--link` for live dev. Skills use prefix `sax-` to avoid collisions. Use `--project --compat` to install to `./.agents/skills/sax-*` instead of dedicated folders.

## Structure

| Directory | Description |
|---|---|
| `agents/` | Agent definitions (Markdown with YAML frontmatter: role, permissions, state machine, handoff format) |
| `skills/` | Skills (one subdirectory per skill with a `SKILL.md` entrypoint and optional `refs/`, `references/`, `languages/`, `infrastructure/`) |
| `commands/` | Slash-command definitions (Markdown prompt bodies with an optional YAML frontmatter: `description:`, `agent:`) |

## Agents

| Agent | Mode | Description |
|---|---|---|
| `business-analyst` | primary | Refines software requests into approved, ready-to-create tickets |
| `system-analyst` | primary | Analyzes tickets against the codebase and presents implementation options for a decision |
| `coder` | primary | Implements an approved ticket from its requirements and selected direction, then verifies |
| `sub-code-impact-explorer` | subagent | Read-only codebase discovery for the System Analyst |
| `sub-ticket-context-reader` | subagent | Read-only ticket and discussion retrieval for the Business Analyst |
| `sub-docs-glossary-reader` | subagent | Resolves a single unknown term from `docs/`, cached in `.ai-temp/` so terms are not re-searched each session |
| `sub-docs-topic-reader` | subagent | Returns documented content relevant to one topic |
| `documenter` | primary | Generates or updates project documentation for any repository using the docs taxonomy and checks (typically Python/uv) |
| `sub-researcher` | subagent | Searches the web for libraries, frameworks, tools, patterns, and technical solutions |

## Skills

| Directory | Description |
|---|---|
| `architecture-review/` | Staff-level codebase health review (monoliths, silent failures, type safety, test coverage, LLM friendliness) |
| `code-review-django/` | Review following personal engineering practices (security, performance, testing, design) |
| `code-review-python/` | Python idioms, PEP 8, type hints and modern Python review |
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
| `ticket-writing/` | Canonical ticket content rules shared by the analysts (title, prefixes, soft-wrap, diagrams, language) |
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

- **Plain CommonMark only.** No raw HTML, no custom containers/admonitions. Use Mermaid fenced code blocks (`` ```mermaid ``) only when the user asks for a diagram or chart. When a Mermaid diagram appears inside a ticket body, use the same language as the ticket.
- **ASCII-first charset.** No emoji, no box-drawing/arrow/dingbat glyphs. Prefer `--` over the em-dash character and `->` over the arrow character; use `*` / `-` bullets and `[x]` / `[ ]` checkboxes instead of Unicode list markers.
- **Headings** use ATX style (`## Title`); avoid setext (underlined) headings and a single `#` for section bodies.
- **Structure over layout.** Prefer headings, short bullets, and small tables. Keep lines under ~100 characters and tables narrow so they do not wrap in split panes.
- **Fenced code blocks** carry a language tag (e.g. `` ```python ``); avoid indented code blocks.
- **Self-contained output.** No relative links to repo files the reader may not have; inline the evidence (path:line) instead.
- **Literal special characters** must be escaped or placed in code spans so no TUI mis-parses them.

## No code

This repository contains no application code, tests, lint, typecheck, or CI. It is purely instruction definitions for coding agents.
