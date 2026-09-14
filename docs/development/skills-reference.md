# Skill reference

Who is this for? This page catalogs every skill in `skills/`, with its purpose
and trigger keywords. Source of truth: `skills/*/SKILL.md`.

## Summary

| Skill | Purpose |
|---|---|
| [architecture-review](#architecture-review) | Staff-level codebase health review |
| [code-review](#code-review) | Code review best practices |
| [commit](#commit) | Safely stage and commit changes |
| [commit-message](#commit-message) | Draft a structured commit message |
| [create_github_issue](#create_github_issue) | Open a GitHub issue via `gh` |
| [debug](#debug) | Investigate failures, implement minimal fixes |
| [django-migration](#django-migration) | Django migration generation |
| [django-models](#django-models) | Django ORM model design |
| [documentation](#documentation) | Canonical docs site taxonomy, audit, style, and build checks |
| [find-bugs](#find-bugs) | Bug and vulnerability finding |
| [pull-request](#pull-request) | Validate, commit, push, and open a PR |
| [push](#push) | Stage, validate with tox, and push |
| [release](#release) | Generate release notes and a GitHub release |
| [security](#security) | Orchestrated security audit |
| [security-audit](#security-audit) | Threat-modeling security audit |
| [security-owasp](#security-owasp) | OWASP-based security review |
| [spec-inspect](#spec-inspect) | Audit `.specs/` against codebase behavior |
| [spec-write](#spec-write) | Interactive specification refinement |
| [testing-guidelines](#testing-guidelines) | Testing patterns and guidance |
| [tox-fix](#tox-fix) | Run tox, fix failures, re-run until green |
| [upgrade](#upgrade) | Dependency upgrade checker |

## architecture-review

Staff-level codebase health review. Finds monolithic modules, silent failures,
type safety gaps, test coverage holes, and LLM-friendliness issues
(`skills/architecture-review/SKILL.md:2-3`).

## code-review

Code review following personal engineering practices. Use when reviewing pull
requests, examining code changes, or providing feedback on code quality.
Covers security, performance, testing, and design review
(`skills/code-review/SKILL.md:2-3`).

## commit

Safely stage and commit changes. Handles branch safety checks on protected
branches, invokes `commit-message` to draft the message, presents a preview,
and commits upon confirmation (`skills/commit/SKILL.md:2-3`).

## commit-message

Generates a clear, structured commit message based on uncommitted changes.
Trigger on "commit changes", "propose commit message", "create commit message",
"show commit" (`skills/commit-message/SKILL.md:2-3`).

## create_github_issue

Creates a new GitHub issue or ticket for bugs, enhancements, or tasks using
the GitHub CLI (`gh`). Trigger on "open a ticket", "file an issue", "create a
GitHub task" (`skills/create_github_issue/SKILL.md:2-3`).

## debug

Investigates test failures, regressions, and diffs to identify root causes and
implement minimal, robust fixes without modifying tests unless explicitly
approved. Use for "debug code", "fix code" (`skills/debug/SKILL.md:2-3`).

## django-migration

Generates Django database migrations. Use when creating migrations,
adding/removing columns or tables, adding indexes, or resolving migration
conflicts (`skills/django-migration/SKILL.md:2-3`).

## django-models

Designs Django ORM models following architectural conventions for silos,
replication, relocation, and foreign keys. Not for Pydantic models, dataclasses,
ML models, or Protobuf (`skills/django-models/SKILL.md:2-3`).

## documentation

Canonical rules and checks for the docs site: site taxonomy, audit clauses,
style, and build verification. Trigger on "audit docs", "fix documentation",
"docs coverage", "check docs", "generate docs", "document the project".
Loaded by the documenter agent to plan, write, and verify generated
documentation (`skills/documentation/SKILL.md:3`).

## find-bugs

Finds bugs, security vulnerabilities, and code quality issues in local branch
changes. Use when asked to review changes, find bugs, security review, or
audit code on the current branch (`skills/find-bugs/SKILL.md:2-3`).

## pull-request

Validates changes, commits, pushes, drafts a Conventional PR description, and
opens a GitHub Pull Request. Decides branch name automatically from changes
(`skills/pull-request/SKILL.md:2-3`).

## push

Stages changes, runs tox validation, generates a commit message, and pushes to
the remote repository. Stops if tox fails (`skills/push/SKILL.md:2-3`).

## release

Generates release notes and creates a GitHub release by comparing current HEAD
with the latest tag. Trigger on "create release" or "show release"
(`skills/release/SKILL.md:2-3`).

## security

Orchestrated security audit using `security-audit` (threat modeling) and
`security-owasp` (OWASP confidence). Use for "audit the code", "find
vulnerabilities", "security review" (`skills/security/SKILL.md:2-3`).

## security-audit

Threat-modeling security audit: attack surfaces, secrets, SSRF, SQLi, open
endpoints, auth flaws. Use ONLY when invoked via the security skill or when
explicitly asked for threat modeling (`skills/security-audit/SKILL.md:2-3`).

## security-owasp

OWASP-based security review: trace data flow, verify exploitability, report
only high-confidence findings. Use ONLY when invoked via the security skill or
when explicitly asked for an OWASP review (`skills/security-owasp/SKILL.md:2-3`).

## spec-inspect

Audits specification files in the `.specs` directory against existing codebase
behavior to flag ambiguities, missed paths, conflicts, and contradictions with
2 solutions per finding (`skills/spec-inspect/SKILL.md:2-3`).

## spec-write

Interactively analyzes and refines specification/requirement files in a loop.
Files without an absolute path are resolved inside `.specs/` at the project
root (`skills/spec-write/SKILL.md:2-3`).

## testing-guidelines

Guide for writing tests. Use when adding new functionality, fixing bugs, or
when tests are needed. Emphasizes integration tests, real-world fixtures, and
regression coverage (`skills/testing-guidelines/SKILL.md:2-3`).

## tox-fix

Runs tox tests and linting, analyzes failures, fixes code/formatting errors,
and re-runs until all checks pass. Use when asked to "run tox" (`skills/tox-fix/SKILL.md:2-3`).

## upgrade

Audits Python dependencies in `pyproject.toml` using uv and tox, upgrades
packages one by one, and verifies stability. Triggers on "sax upgrade",
"upgrade dependencies", "audit security dependencies"
(`skills/upgrade/SKILL.md:2-3`).

## Next steps

- Loading skills in a TUI: [Getting started](../user-guide/getting-started.md).
- Authoring a new skill: [Contribution guidelines](contribution.md).