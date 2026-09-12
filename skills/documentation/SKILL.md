---
name: documentation
description: Audits and fixes the docs site (docs/) for completeness, correctness and consistency. Trigger on "audit docs", "fix documentation", "docs coverage", "check docs", or when a feature branch touches docs/.
---

## Objective
Make `docs/` complete (no missing pages or coverage gaps), correct (no broken, stale or wrong content) and consistent (one voice, one terminology, one writing style). Run an iterative audit -> report -> fix -> re-verify loop until the docs are clean. Never fix silently: present findings first.

## Workflow

### 1. Scope
The docs site is organized in three guides. Determine which one(s) the audit covers:

1. **User Guide** -- target audience: end users, product managers, non-technical stakeholders. What the application does and how to interact with it. Required sub-sections:
   - Overview & Key Features
   - Getting Started & Onboarding
   - Feature Workflows
   - Interface Navigation
   - FAQs & Troubleshooting
2. **Administrative Guide** -- target audience: system administrators, DevOps, SecOps. Installation, infrastructure, runtime management, operations. Required sub-sections:
   - Architecture & Topology
   - Prerequisites & Infrastructure
   - Deployment & Provisioning
   - Configuration Reference
   - Maintenance & Operations
   - Security & Compliance
3. **Development Guide** -- target audience: software engineers, contributors, QA. Local development, code standards, contribution pipelines. Required sub-sections:
   - Local Environment Setup
   - Codebase Structure
   - Git Workflow & Branching Strategy
   - Testing Strategy
   - CI/CD & Build Pipelines

- If the user names a page/section, audit only that (plus its interlock points).
- If a feature branch is given (or docs/ changed), audit the touched sections + interlock points of the change.
- Default: full sweep over all three guides and any top-level or shared sections (glossary, references).

### 2. Audit (read-only, produce findings)
Run every applicable check. Group findings by clause: NAV / COVERAGE / LINKS / CONTENT / STYLE.

First map every page to one of the three guides (User / Administrative / Development) or shared sections (glossary, API reference, landing page). Flag pages whose content targets a different guide than the one they are placed in (e.g. a deployment topic inside the User Guide). Flag missing required sub-sections per guide (per the lists above) or sub-sections present but empty.

**NAV -- registration:**
- Every `docs/**/*.md` must be reachable: listed in its owning `.pages` nav block, covered by a `...` fallback, or the section's index.md. Flag orphans.
- Every `.pages` entry must point to an existing file/dir; flag dead entries.
- `.pages` files must use the `nav:` key (awesome-pages); flag wrong keys.

**COVERAGE -- interlock points:**
- **Quick Start**: the docs must include a quick start page describing the initial configuration of the application end to end (create the first base structure, wire a channel, configure the first feature, reach a verifiable result), reachable from the top-level navigation and linked from the landing page. Flag its absence, or a quick start that is incomplete, stale or not reachable.
- **Settings reference**: the docs must include a complete settings page (Configuration Reference) listing every configuration flag/value the application exposes, each with a detailed description and the effect of the setting. It must be kept in sync with the settings source of truth (settings files, config fragments, environment variables, admin-editable values): flag missing settings, undocumented flags, outdated defaults or descriptions, and settings documented but no longer existing.
- **Model reference (Django)**: if the project is a Django application, every model must have a dedicated page in the development guide, describing its purpose, its connections (foreign keys, relations to other models, reverse relations) and the meaning of each field (name, type, purpose, optionality, defaults). Flag models without a page, models whose page is stale (fields/relations no longer in the model), or pages describing fields that do not exist in the source.
- **CLI reference**: if the project provides CLI commands (management commands, scripts, entry points), each command must be documented in a dedicated section with every argument and option described (name, type, purpose, defaults, interplay between options). It must be kept in sync with the CLI source of truth (argparse/click definitions, management commands): flag commands without a page, undocumented arguments/options, outdated defaults, or documented options that no longer exist.
- **REST API reference**: the REST API must have a dedicated usage page in the user guide (endpoints, methods, request/response examples, authentication, error cases) and a dedicated page in the development guide explaining how to add new endpoints (routing conventions, serializers, permissions, testing). Flag missing API pages, endpoints not covered, or pages stale against the router/URL definitions.
- **Export/Import reference**: if the application provides export/import functionality (CSV, JSON, Excel, migrations between instances), it must be documented in the user guide with: the file format, the list of columns/fields (names, types, required/optional, allowed values) and the constraints and limitations (file size limits, row limits, encoding, character restrictions, format version). Explicitly state whether import runs synchronously or asynchronously (background task) and how the outcome is reported (immediate response vs. later notification/log). Flag missing, incomplete or stale export/import documentation.
- Every admin-registered model -> covered by an administrative guide page or a `HELP_LINKS`-style URL->doc mapping; if the project ships a system check for that mapping, run it.
- Config/settings/deployment additions -> documented in the administrative guide (configuration, deployment); every setting must appear in the settings reference with description and effect (see above).
- User-facing features (UI screens, preferences, user flows) -> documented in the user guide; new API endpoints -> API reference pages; new plugin/backend types -> their guide section.
- New or changed CLI commands -> the CLI reference section (arguments/options documented, see above); every command must be covered.
- New or changed REST endpoints -> user guide API usage page and development guide endpoint-creation page (see above).
- New or changed export/import functionality -> the user guide export/import reference (file format, columns, constraints, sync/async note, see above).
- Domain terms -> glossary entry + listed on the glossary index; first use in a page links to the term.

**Quality & Maintenance:**
- **Single source of truth**: never duplicate configuration tables or instructions; flag duplicated content and recommend cross-references (relative paths or anchors) instead.
- **Code block validity**: every terminal command, code snippet or environment variable shown in the docs must be syntax-checked and tested against the actual codebase defaults. Flag commands that would fail, flags that do not exist, or examples that contradict the code.
- **Change synchronization**: whenever source code, environment variables or endpoints change, flag the corresponding documentation sections as needing an update in the same changeset.

**LINKS:**
- Build the docs site with the project's build command (e.g. `tox -e docs`) and run the link checker if one exists (e.g. `tox -e docs-test`, site + anchor + `.pages` checks).
- Flag internal links using `.md` extension or dead `#anchors`; cross-links must use relative site paths with trailing-slash section paths.

**CONTENT:**
- Stale entity names (model/field/URL/setting/CLI flag) -- verify against source: admin registrations, models, settings files, CLI, management commands.
- Contradictions: same fact stated differently across pages (e.g. defaults in the landing page vs the configuration page).
- Typos and broken formatting: common misspellings, unclosed fences, mis-nested backticks, mismatched heading levels.
- Placeholders: TODO/WIP, dummy URLs (except documented placeholder features), lorem-ipsum.
- Screenshots: no `![](...)` / `.. image::` references unless screenshots are an accepted convention; flag unreferenced image assets too.

**STYLE -- only for pages you will edit:**
- Purpose-first opening ("Who is this for?"), action-oriented headings, numbered imperative steps naming UI elements, active voice / second person, first-use glossary links, acronym expansion, TL;DR on long pages, one job per page, no emojis/"just"/jargon, "Next steps" closer, valid fences/front matter/relative links.
- **Formatting standards**: Markdown only; clear `##` / `###` headers for scannability; bold for key interface elements and critical flags; syntax-highlighted code blocks with language indicators (```bash, ```yaml, ```python).

### 3. Report & Confirm
Present findings grouped by clause with severity (High/Medium/Low) and, when the misplacement rule applies, by guide (User / Administrative / Development), with a proposed fix per finding. Ask the user which to apply (default: all High + Medium). Wait for confirmation before editing.

### 4. Fix (iterative loop)
- Fix one finding at a time, following the STYLE rules for any written text.
- Keep each finding a single diff-reviewable change.
- After each fix batch, re-run the affected checks (build/link tests/nav/glossary) before moving on.
- Loop: re-audit the edited pages -> if new issues emerged, report -> fix -> verify, up to 3 iterations, then stop and summarize.

### 5. Verify & Report
- Rebuild the docs site and run the link checker if available (must pass).
- Run lint/type/tests only if code files changed (e.g. a URL->doc mapping).
- Report: findings fixed (with file:line), checks green, remaining blockers.
- Do not commit unless asked.
