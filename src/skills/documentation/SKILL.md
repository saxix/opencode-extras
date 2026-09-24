---
name: documentation
description: 'Canonical rules and checks for the docs site: site taxonomy, audit clauses, style, and build verification. Trigger on "audit docs", "fix documentation", "docs coverage", "check docs", "generate docs", "document the project", or when a feature branch touches docs/. Also loaded by the documenter agent to plan, write, and verify generated documentation.'
---

## Purpose

This is the stateless domain manual for anything dealing with `docs/`. It defines the canonical site taxonomy, the audit checklists, the style rules, and the verification steps. Anyone may apply it: a user auditing docs, an agent fixing them, or the `documenter` agent generating a set from scratch. Keep the site complete (no missing pages), correct (no broken, stale, or wrong content), and consistent (one voice, one terminology, one style). Never fix silently: present findings before editing.

## Site taxonomy (single source of truth)

The docs site is organized in four guides plus shared sections. Required sub-sections:

1. **User Guide** -- end users, product managers, non-technical stakeholders. What the application does and how to interact with it.
   - Overview & Key Features
   - Getting Started & Onboarding
   - Feature Workflows
   - Interface Navigation
   - FAQs & Troubleshooting
2. **Administrative Guide** -- system administrators, DevOps, SecOps. Runtime configuration and operations.
   - Configuration Reference (every setting, source of truth for settings)
   - Monitoring & Observability
   - Maintenance & Operations
   - Security & Compliance
   - Troubleshooting
3. **Development Guide** -- software engineers, contributors, QA. Local development, code standards, contribution pipelines.
   - Local Environment Setup
   - Codebase Structure
   - Git Workflow & Branching Strategy
   - Testing Strategy
   - CI/CD & Build Pipelines
   - Contribution Guidelines
   - Model Reference (Django projects): one page per model with purpose, relations, and field meaning
   - CLI Reference: one page per command with every argument/option
4. **Deploy Guide** -- deployment owners, SREs, platform engineers. Getting the application into a running environment.
   - Architecture & Topology
   - Prerequisites & Infrastructure
   - Installation
   - Provisioning & Deployment
   - Environment Variables (source of truth for configuration injected at runtime)
   - Release & Rollback

**Shared sections:** landing page/index, glossary (one term per entry, index page, first-use links), API reference (usage already belongs to the User Guide; a Development Guide page explains how to add endpoints).

> **CLI / MCP Server note:** for these project types the taxonomy still applies, but the following sub-sections become *mandatory* and must be detailed (see profile below): User Guide must contain **Installation**, **Arguments/Commands**, **Usage Examples**; Development Guide must contain **Development / Contributing**. Treat their absence as a missing required sub-section.

## Scope tailoring -- mandatory scoping question

Not every project needs all four guides. Before generating or auditing, you MUST ask the user which guides/sections they want.

- Ask explicitly which of the four guides are in scope: **User Guide**, **Administrative Guide**, **Development Guide**, **Deploy Guide** (plus shared sections as needed). Do not assume the full set.
- For presets and guide mapping, see `src/documenter/specs/index.md` (Library → `library.md`, CLI → `cli.md`, Skill → `skill.md`, MCP Server → `mcp-server.md`, Project → `project.md`). Propose presets and let the user pick or customize; record the confirmed scope as the baseline for coverage, gaps, and verification. Never generate excluded guides without explicit confirmation.
- Example question (adapt language to the project's default language): "What type of project is this? For a library, User Guide and Development Guide are usually enough, without Deploy/Administrative. Which guides do you want to include? [ ] User [ ] Administrative [ ] Development [ ] Deploy"
- For profile details, see the corresponding spec in `src/documenter/specs/` (`library.md`, `cli.md`, `skill.md`, `mcp-server.md`, `project.md`); all profiles inherit `common.md`.
- If the user does not answer, do not proceed to `WRITE`; stay in `INTAKE`/`SCOPE` and re-ask. A vague "everything" / "full set" means all four guides; otherwise tailor.

### Profile-specific mandatory coverage

When the project type is confirmed, load the corresponding profile from `src/documenter/specs/` and treat its Mandatory Sections as required. See `library.md`, `cli.md`, `skill.md`, `mcp-server.md`, `project.md` for the per-type mandatory areas. Map them to the selected guides and flag any missing area as High severity. For per-type details, see the corresponding spec: `src/documenter/specs/<type>.md`.

For reference, the CLI/MCP mandatory areas are:

1. **Installation** -- prerequisites (OS, Python/Node version, dependencies), all supported install methods (for example `pipx`, `uv tool`, `pip`, `brew`, `docker`, `npm`), version check / smoke test, upgrade/uninstall notes, and troubleshooting for common install failures. Sync with `pyproject.toml`, `package.json`, `Dockerfile`, and install scripts; test every command.
2. **Arguments / Commands** -- complete reference of every command, sub-command, argument, option/flag, and env-var/config-file key that affects CLI behaviour: name, type, required/optional, default, allowed values, effect, and mutual-exclusion or dependency rules. Source of truth is the CLI definition (`argparse`/`click`/`typer`/`commander`/`yargs`, MCP `tools`/`resources`/`prompts` definitions). One page per command for rich CLIs; single-page table only for trivial single-command tools. For MCP Servers also document transport (stdio/SSE), tool list with input/output schemas, and client configuration snippets.
3. **Usage Examples** -- copy-pasteable, tested examples covering: minimal happy path, common real-world invocations (at least 3-5), edge cases and error handling, and, for MCP Servers, an end-to-end client interaction (for example Claude Desktop / MCP Inspector config + tool call + expected response). Each example must state prerequisites, exact command, expected output/exit code, and where to find logs. Flag invented or untested examples.
4. **Development (Contributing)** -- local environment setup, codebase structure relevant to the CLI/MCP, branch workflow, code style/lint, testing strategy (unit/integration for commands/tools), how to add a new command/flag/tool, CI/CD, and contribution guidelines (issue/PR template, DCO/CLA if any, release process).

Verification for this profile: every install command is runnable, every argument/flag exists in code with correct default/type, every example was executed (or explicitly marked as "requires credentials/network" with a dry-run alternative), and the Development page lets a new contributor go from clone to passing tests. For per-type verification, see the checklist in the corresponding spec file.

Rules of the taxonomy (applied to the *selected* scope only):

- If the project has an existing structure, map every page to one of the four guides or shared sections; flag pages whose content targets a different guide than the one they are placed in (for example a deployment topic inside the Development Guide).
- Flag missing required sub-sections per *selected* guide, or sub-sections present but empty. Do not flag a missing guide that the user explicitly excluded.
- When the `documenter` agent generates a set, this taxonomy defines the required coverage *for the selected guides only*; when auditing, it defines the baseline to verify *for the selected scope*. Excluded guides are not gaps.

## How to apply

Determine the scope first:

- **Mandatory scoping question:** before any generation or full audit, ask which guides are wanted (see Scope tailoring above). Do not start writing until the user confirms the set.
- If the user names a page or section, audit or generate only that (plus its interlock points) -- but still confirm that the owning guide is in the selected scope.
- If a feature branch is given (or `docs/` changed), cover the touched sections plus the interlock points of the change, constrained to the selected guides.
- Default if the user explicitly says "full" / "everything": full sweep over all four guides and any shared sections. Otherwise scope is exactly what the user confirmed; an unanswered question is not a default.

Then run the applicable clauses below, grouped: NAV / COVERAGE / LINKS / CONTENT / STYLE, limited to the confirmed scope.

## NAV -- registration

- Every `docs/**/*.md` must be reachable: listed in its owning `.pages` nav block, covered by a `...` fallback, or the section's `index.md`. Flag orphans.
- Every `.pages` entry must point to an existing file or dir; flag dead entries.
- `.pages` files must use the `nav:` key (awesome-pages); flag wrong keys.

## COVERAGE -- interlock points

Documentation must stay in sync with the source of truth for every project artifact:

- **Quick Start**: a page describing initial configuration end to end (first base structure, channel wiring, first feature, a verifiable result), reachable from top-level navigation and linked from the landing page. Flag absence, incompleteness, staleness, or non-reachability.
- **Settings reference**: a complete Configuration Reference in the Administrative Guide listing every configuration flag/value the application exposes, each with description and effect, kept in sync with the settings source of truth (settings files, config fragments, environment variables, admin-editable values). Flag missing settings, undocumented flags, outdated defaults, or documented settings that no longer exist.
- **Environment variables**: every runtime configuration variable in the Deploy Guide, synced with `.env.example`, compose/container env blocks, and deployment manifests. Flag undocumented or obsolete variables.
- **Model reference (Django)**: every model page in the Development Guide with purpose, connections (FKs, relations, reverse relations), and field meaning (name, type, purpose, optionality, defaults). Flag models without a page, stale pages, or pages describing fields that do not exist.
- **CLI reference (and MCP tool reference)**: every command documented in the Development Guide, synced with the CLI source of truth (argparse/click/typer definitions, management commands, MCP `tools`/`resources`/`prompts`): name, type, purpose, defaults, interplay between options. Flag undocumented commands/arguments, outdated defaults, or documented options that no longer exist.
- **CLI / MCP Server mandatory sections**: when the project is a CLI or MCP Server (detected via CLI entry points in `pyproject.toml`/`package.json` or `mcp` dependencies), flag missing or shallow Installation, Arguments, Usage Examples, or Development/Contributing pages as High. Each must meet the detail level defined in the CLI / MCP Server profile above.
- **REST API reference**: a User Guide usage page (endpoints, methods, request/response examples, authentication, error cases) and a Development Guide page explaining how to add endpoints (routing conventions, serializers, permissions, testing). Flag missing pages, uncovered endpoints, or staleness against router/URL definitions.
- **Export/Import reference**: when the application provides export/import functionality, a User Guide page with format, column list (name, type, required/optional, allowed values), constraints (size/row limits, encoding, format version), whether import runs synchronously or in background, and how the outcome is reported. Flag missing, incomplete, or stale coverage.
- **Admin-registered models**: every admin-registered model covered by an Administrative Guide page or a `HELP_LINKS`-style URL-to-doc mapping; if the project ships a system check for that mapping, run it.
- **New artifacts map to the right guide**: user-facing features -> User Guide; configuration/settings -> Administrative Guide (Settings Reference); deployment/env additions -> Deploy Guide; codebase/testing/contributions -> Development Guide; new API endpoints -> API reference pages; new plugin/backend types -> their guide section; new or changed CLI commands -> CLI reference; changed export/import -> the User Guide export/import reference.
- **Domain terms**: glossary entry plus index listing; first use in a page links to the term.

## Quality & maintenance

- **Single source of truth**: never duplicate configuration tables or instructions; flag duplicated content and recommend cross-references (relative paths or anchors) instead.
- **Code block validity**: every terminal command, code snippet, and environment variable must be syntax-checked and tested against the codebase defaults. Flag commands that would fail, flags that do not exist, or examples that contradict the code.
- **Change synchronization**: whenever source code, environment variables, or endpoints change, the corresponding documentation sections belong in the same changeset.

## LINKS

- Build the docs site with the project's build tool (for example `tox -e docs`, `properdocs`, or `mdbook`), then run the link checker if one exists (for example `tox -e docs-test`: site + anchor + `.pages` checks).
- Flag internal links using the `.md` extension or dead `#anchors`; cross-links must use relative site paths with trailing-slash section paths.

## CONTENT

- Stale entity names (model/field/URL/setting/CLI flag): verify against source (admin registrations, models, settings files, CLI, management commands).
- Contradictions: the same fact stated differently across pages (for example defaults in the landing page vs. the Configuration Reference).
- Typos and broken formatting: common misspellings, unclosed fences, mis-nested backticks, mismatched heading levels.
- Placeholders: TODO/WIP, dummy URLs (except documented placeholder features), lorem-ipsum.
- Screenshots: no `![](...)` / `.. image::` references unless screenshots are an accepted convention; flag unreferenced image assets too.

## STYLE -- only for pages you edit

- Purpose-first opening ("Who is this for?"), action-oriented headings, numbered imperative steps naming UI elements, active voice / second person, first-use glossary links, acronym expansion, TL;DR on long pages, one job per page, no emojis/"just"/jargon, "Next steps" closer, valid fences/front matter/relative links.
- Formatting standards: Markdown only; `##`/`###` headers for scannability; bold for key interface elements and critical flags; syntax-highlighted code blocks (```bash, ```yaml, ```python).
- Language: project default (README*/docs); fallback English.

## Verify & report

- Rebuild the docs site and run the link checker if available (must pass) -- for the selected scope only; excluded guides must not be built or flagged.
- Run lint/type/tests only if code files changed (for example a URL-to-doc mapping).
- Report findings grouped by clause with severity (High/Medium/Low), a proposed fix per finding, and up to three fix-verify loops. Present findings before editing; ask which to apply when the scope is ambiguous (default: all High + Medium).
- Report with inline evidence: `path/to/file:line` references in the findings, and a summary of fixes applied, checks green, and remaining blockers. Explicitly list the confirmed scope (included vs. excluded guides) at the top of the report.
- Do not commit unless asked.