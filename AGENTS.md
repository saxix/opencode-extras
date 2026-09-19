# agents-skills

Reusable agents, skills, and commands for AI coding TUIs. All definitions are plain Markdown and all generated output follows the TUI-portable standard in this file, so they render correctly in `opencode`, Claude Code, Gemini CLI, hermes, and other terminal assistants.

## Install

Windows: `scripts/install-opencode.ps1 -Global` creates user-wide junctions;
`-WorkspaceRoot <existing-project-or-workspace>` installs locally under `.opencode/`.
`scripts/install-workspace.ps1` remains a compatible local entrypoint. Shared instructions
are optional. Preserve existing provider, model, and unrelated settings; restart OpenCode.

Unix: `make install-opencode` links definitions globally; `make install-claude` links skills.
No installer replaces user configuration. See `docs/deploy/installation.md`.

## Structure

| Directory | Description |
|---|---|
| `src/agents/` | Agent definitions (Markdown with YAML frontmatter; `description:` required) |
| `src/skills/` | Skill directories with `SKILL.md` and optional reference docs |
| `src/commands/` | Reusable command prompts |
| `src/instructions/` | Shared workspace operating rules |
| `scripts/` | Windows installer and smoke test |
| `opencode.jsonc` | Toolkit checkout configuration, not a user config template |

## Agents

| Agent | Mode | Description |
|---|---|---|
| `business-analyst` | primary | Refines software requests into approved, ready-to-create tickets |
| `system-analyst` | primary | Analyzes tickets against the codebase and presents implementation options for a decision |
| `coder` | primary | Implements an approved ticket from its requirements and selected direction, then verifies |
| `code-impact-explorer` | subagent | Read-only codebase discovery for the System Analyst |
| `ticket-context-reader` | subagent | Read-only ticket and discussion retrieval for the Business Analyst |
| `docs-glossary-reader` | subagent | Resolves a single unknown term from `docs/` with a minimal, capped report |
| `docs-topic-reader` | subagent | Returns documented content relevant to one topic |
| `documenter` | primary | Generates or updates documentation using the existing project's tools |
| `researcher` | subagent | Searches the web for libraries, frameworks, tools, patterns, and technical solutions |

## Skills

| Directory | Description |
|---|---|
| `architecture-review/` | Staff-level codebase health review |
| `code-review/` | Code review best practices |
| `commit/` | Safely stage and commit changes |
| `commit-message/` | Draft a structured commit message |
| `create_github_issue/` | Open a GitHub issue via `gh` |
| `debug/` | Investigate failures, implement minimal fixes |
| `django-migration/` | Django migration generation |
| `django-models/` | Django ORM model design |
| `documentation/` | Canonical docs site taxonomy, audit clauses, style, and build checks (loaded by `documenter`; triggered standalone for audits) |
| `find-bugs/` | Bug and vulnerability finding |
| `pull-request/` | Validate, commit, push, and open a PR |
| `push/` | Stage intended files, validate with project tools, and push |
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

## Conventions

- Each skill MUST have a `SKILL.md` at its directory root.
- `SKILL.md` frontmatter uses `name:` and `description:` (required; the description carries trigger keywords) plus optional `license:`, `compatibility:`, `metadata:` keys.
- Agents and commands use Markdown with YAML frontmatter; `description:` is required.
  OpenCode agents use `permission` (singular) with tool keys such as `edit`, `bash`, and `task`.
  Put broad permission patterns first and narrow exceptions last. Do not use legacy
  `permissions` lists with `action/resource/effect`.
- Reference materials live alongside `SKILL.md` in named subdirectories (no enforced convention).
- `.gitignore` excludes all dotfiles and editor backup files (`~*`); only `.gitignore` itself is kept among dotfiles.
- `.ai-temp/` is internal scratch, never committed or treated as a deliverable. Analysts persist
  state in `.ai-temp/<repo_key>/<activity_id>/<agent>.yaml` at the workspace root, autosaving
  material transitions and supporting annotate/resume requests. The business analyst keeps a
  separate `.ai-temp/<repo_key>/glossary-known-terms.yaml` per repository. Verify ignore rules
  in tracked workspaces; this checkout's gitignore does not cover its parent. Workspace-required
  reports and prompt logs follow explicit local policy and permissions, never scratch conventions.
- Read `src/instructions/workspace.md` for multi-repository operating defaults. Keep shared
  rules there; repository-specific runners, versions, and conventions remain local.
- Keep organization-specific paths, report language, prompt logging, and report permissions
  in deployment configuration and local `AGENTS.md`, not in `src/`. Default analyst writes
  are scratch-only; report persistence requires both local policy and matching permissions.
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

## Verification

There is no application code or application test suite. Verify definitions with the OpenCode
loader and review. Run `scripts/test-workspace-install.ps1` when changing the Windows installer
and `scripts/test-opencode-loader.ps1` for local/global discovery and policy merging.
`make test` is the Unix install smoke test. See `docs/development/testing.md`.