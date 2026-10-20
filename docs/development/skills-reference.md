# Skill reference

Who is this for? This page catalogs every skill in `src/skills/`, with its purpose
and trigger keywords. Source of truth: `src/skills/*/SKILL.md` (26 skills).

## Summary

| Skill | Purpose |
|---|---|
| [architecture-review](#architecture-review) | Staff-level codebase health review |
| [code-review-django](#code-review-django) | Code review following personal engineering practices (Django stack) |
| [code-review-python](#code-review-python) | Python idioms, PEP 8, type hints and modern Python review |
| [commit](#commit) | Safely stage and commit changes |
| [commit-message](#commit-message) | Draft a structured commit message |
| [create_github_issue](#create_github_issue) | Open a GitHub issue via `gh` |
| [debug](#debug) | Investigate failures, implement minimal fixes |
| [django-migration](#django-migration) | Django migration generation |
| [django-models](#django-models) | Django ORM model design |
| [documentation](#documentation) | Canonical docs site taxonomy, audit, style, and build checks |
| [find-bugs](#find-bugs) | Bug and vulnerability finding |
| [issue-bookmarks](#issue_bookmarks) | Analyst ticket bookmark rules and the save/load/list operations |
| [pull-request](#pull-request) | Validate, commit, push, and open a PR |
| [push](#push) | Stage, validate with tox, and push |
| [release](#release) | Generate release notes and a GitHub release |
| [security](#security) | Orchestrated security audit |
| [security-audit](#security-audit) | Threat-modeling security audit |
| [security-owasp](#security-owasp) | OWASP-based security review |
| [spec-inspect](#spec-inspect) | Audit `.specs/` against codebase behavior |
| [spec-write](#spec-write) | Interactive specification refinement |
| [state-persistence](#state-persistence) | Canonical analyst state layout, shared findings, write policy, legacy state |
| [testing-guidelines](#testing-guidelines) | Testing patterns and guidance |
| [ticket-writing](#ticket-writing) | Canonical ticket content rules shared by the analysts |
| [tox-fix](#tox-fix) | Run tox, fix failures, re-run until green |
| [upgrade](#upgrade) | Dependency upgrade checker |

## architecture-review

Staff-level codebase health review. Finds monolithic modules, silent failures,
type safety gaps, test coverage holes, and LLM-friendliness issues
(`src/skills/architecture-review/SKILL.md:2-3`).

## code-review-django

Code review following personal engineering practices. Use when reviewing pull
requests, examining code changes, or providing feedback on code quality.
Covers security, performance, testing, and design review
(`src/skills/code-review-django/SKILL.md:2-3`).

## code-review-python

Framework, checklist, and idiomatic conventions for reviewing Python code
(PEP 8, Type Hints, Modern Python) (`src/skills/code-review-python/SKILL.md:2-3`).

## commit

Safely stage and commit changes. Handles branch safety checks on protected
branches, invokes `commit-message` to draft the message, presents a preview,
and commits upon confirmation (`.src/skills/commit/SKILL.md:2-3`).

## commit-message

Generates a clear, structured commit message based on uncommitted changes.
Trigger on "commit changes", "propose commit message", "create commit message",
"show commit" (`.src/skills/commit-message/SKILL.md:2-3`).

## create_github_issue

Creates a new GitHub issue or ticket for bugs, enhancements, or tasks using
the GitHub CLI (`gh`). Trigger on "open a ticket", "file an issue", "create a
GitHub task" (`.src/skills/create_github_issue/SKILL.md:2-3`).

## debug

Investigates test failures, regressions, and diffs to identify root causes and
implement minimal, robust fixes without modifying tests unless explicitly
approved. Use for "debug code", "fix code" (`.src/skills/debug/SKILL.md:2-3`).

## django-migration

Generates Django database migrations. Use when creating migrations,
adding/removing columns or tables, adding indexes, or resolving migration
conflicts (`.src/skills/django-migration/SKILL.md:2-3`).

## django-models

Designs Django ORM models following architectural conventions for silos,
replication, relocation, and foreign keys. Not for Pydantic models, dataclasses,
ML models, or Protobuf (`.src/skills/django-models/SKILL.md:2-3`).

## documentation

Canonical rules and checks for the docs site: site taxonomy, audit clauses,
style, and build verification. Trigger on "audit docs", "fix documentation",
"docs coverage", "check docs", "generate docs", "document the project".
Loaded by the documenter agent to plan, write, and verify generated
documentation (`.src/skills/documentation/SKILL.md:3`).

## find-bugs

Finds bugs, security vulnerabilities, and code quality issues in local branch
changes. Use when asked to review changes, find bugs, security review, or
audit code on the current branch (`.src/skills/find-bugs/SKILL.md:2-3`).

## issue_bookmarks

Canonical rules and procedures for explicit analyst ticket bookmarks, loaded by
the `Business Analyst` and the `System Analyst`. Trigger on "save this work",
"bookmark this", "load my last bookmark", "list my bookmarks"
(`.src/skills/issue-bookmarks/SKILL.md:2-3`). Replaces the retired `issue-save`,
`issue-load`, and `issue-list` commands; the installer removes those command
files on the next run.

| Aspect | Value |
|---|---|
| Operations | save, load, list, selected by the user's request |
| Guard | Active session agent must be exactly `business-analyst` or `system-analyst` |
| Storage | `.ai-temp/business-analyst/<name>.md` or `.ai-temp/system-analyst/<name>.md` |
| Name | `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$`, validated before any file tool |
| Schema | `bookmark`, `agent`, `schema_version`, `ticket_ref`, `ticket_title`, `ticket_language`, `status`, `saved_at` |

Saves are explicit only: there is no autosave and no persistence on a state
transition, per the write policy in the state layout skill
(`src/skills/sax-state-persistence/SKILL.md`), which both analysts also load. Load
restores the compact projection and continues from
`Next action`. List is read-only and shows the analyst's own bookmarks newest
first, marking an invalid file as `invalid` instead of repairing it. The project
shared findings directory at `.ai-temp/findings/` is separate and is never
touched by this skill.

## state-persistence

Canonical analyst state layout shared by the `Business Analyst` and the
`System Analyst`: which `.ai-temp/` path belongs to which analyst, the shared
findings directory, the write policy, the project terms cache, and the legacy
state to ignore. Loaded by the two analysts
(`src/skills/sax-state-persistence/SKILL.md:2`).

| Aspect | Value |
|---|---|
| Layout | `.ai-temp/business-analyst/`, `.ai-temp/system-analyst/`, `.ai-temp/findings/` |
| Write policy | No autosave; a bookmark only on explicit request, a finding without asking |
| Findings | `glossary.yaml` written by the Business Analyst; one `<topic>.md` per observation |
| Legacy | `business-analyst.yaml`, `system-analyst.yaml`, `glossary-known-terms.yaml` ignored |

It was previously the shared spec `src/_shared/sax/state-persistence.md`; it
became a skill so the definitions are loaded like the other shared contracts.
The bookmark contract itself still belongs to
[issue-bookmarks](#issue_bookmarks).

## pull-request

Validates changes, commits, pushes, drafts a Conventional PR description, and
opens a GitHub Pull Request. Decides branch name automatically from changes
(`.src/skills/pull-request/SKILL.md:2-3`).

## push

Stages changes, runs tox validation, generates a commit message, and pushes to
the remote repository. Stops if tox fails (`.src/skills/push/SKILL.md:2-3`).

## release

Generates release notes and creates a GitHub release by comparing current HEAD
with the latest tag. Trigger on "create release" or "show release"
(`.src/skills/release/SKILL.md:2-3`).

## security

Orchestrated security audit using `security-audit` (threat modeling) and
`security-owasp` (OWASP confidence). Use for "audit the code", "find
vulnerabilities", "security review" (`.src/skills/security/SKILL.md:2-3`).

## security-audit

Threat-modeling security audit: attack surfaces, secrets, SSRF, SQLi, open
endpoints, auth flaws. Use ONLY when invoked via the security skill or when
explicitly asked for threat modeling (`.src/skills/security-audit/SKILL.md:2-3`).

## security-owasp

OWASP-based security review: trace data flow, verify exploitability, report
only high-confidence findings. Use ONLY when invoked via the security skill or
when explicitly asked for an OWASP review (`.src/skills/security-owasp/SKILL.md:2-3`).

## spec-inspect

Audits specification files in the `.specs` directory against existing codebase
behavior to flag ambiguities, missed paths, conflicts, and contradictions with
2 solutions per finding (`.src/skills/spec-inspect/SKILL.md:2-3`).

## spec-write

Interactively analyzes and refines specification/requirement files in a loop.
Files without an absolute path are resolved inside `.specs/` at the project
root (`.src/skills/spec-write/SKILL.md:2-3`).

## testing-guidelines

Guide for writing tests. Use when adding new functionality, fixing bugs, or
when tests are needed. Emphasizes integration tests, real-world fixtures, and
regression coverage (`.src/skills/testing-guidelines/SKILL.md:2-3`).

## ticket-writing

Canonical rules for ticket content shared by the `Business Analyst` and the
`System Analyst`: title (no project prefix, `[DRAFT] ` only), title/body
separation, `## Summary`-first body, comment formatting, user story and use case
forms, soft-wrap formatting, Mermaid diagrams, and language resolution
(`.src/skills/ticket-writing/SKILL.md:2-3`). Agents must load it rather than
re-implementing its rules.

## tox-fix

Runs tox tests and linting, analyzes failures, fixes code/formatting errors,
and re-runs until all checks pass. Use when asked to "run tox" (`.src/skills/tox-fix/SKILL.md:2-3`).

## upgrade

Audits Python dependencies in `pyproject.toml` using uv and tox, upgrades
packages one by one, and verifies stability. Triggers on "sax upgrade",
"upgrade dependencies", "audit security dependencies"
(`.src/skills/upgrade/SKILL.md:2-3`).

## Next steps

- Loading skills in a TUI: [Getting started](../user-guide/getting-started.md).
- Authoring a new skill: [Contribution guidelines](contribution.md).