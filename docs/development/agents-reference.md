# Agent reference

Who is this for? This page catalogs every agent in `src/agents/`, with its purpose,
mode, and key constraints. Source of truth: `src/agents/*.md` and `AGENTS.md:32-45`.

## Summary

| Agent | Mode | Purpose |
|---|---|---|
| [business-analyst](#business-analyst) | primary | Refines software requests into approved, ready-to-create tickets |
| [system-analyst](#system-analyst) | primary | Analyzes tickets against the codebase and presents implementation options for a decision |
| [coder](#coder) | primary | Implements an approved ticket from its requirements and selected direction, then verifies |
| [sub-code-impact-explorer](#sub-code-impact-explorer) | subagent | Read-only codebase discovery for the System Analyst |
| [sub-ticket-context-reader](#sub-ticket-context-reader) | subagent | Read-only ticket and discussion retrieval for the Business Analyst |
| [sub-docs-glossary-reader](#sub-docs-glossary-reader) | subagent | Resolves a single unknown term from `docs/` with a minimal, capped report |
| [sub-docs-topic-reader](#sub-docs-topic-reader) | subagent | Returns documented content relevant to one topic |
| [sub-universal-code-reviewer](#sub-universal-code-reviewer) | subagent | Reviews code across languages for bugs, security, performance, and maintainability |
| [documenter](#documenter) | primary | Generates or updates documentation for any repository using the docs taxonomy and checks (typically Python/uv) |
| [sub-researcher](#sub-researcher) | subagent | Searches the web for libraries, frameworks, tools, patterns, and technical solutions |

## business-analyst

Primary agent. Refines product and business requests into approved,
ready-to-create functional tickets without implementing them
(`src/agents/business-analyst.md:2`). Works in the problem domain only, asks one
substantive question per message, and never mutates a ticket before the
approval gate (`src/agents/business-analyst.md:76-85`). May read `README*` and
`docs/`, and delegates retrieval to `sub-ticket-context-reader` and the docs
readers. Cannot edit the repo, run shell, or spawn arbitrary subagents; the
only write locations are its explicit bookmark directory
`.ai-temp/business-analyst/**` and the separate glossary cache
`.ai-temp/glossary-known-terms.yaml`. It never autosaves work: persistence occurs
only through `issue-save`, followed by the role-scoped `issue-load` and
`issue-list` commands (`src/agents/business-analyst.md:151-177`). Applies the
`ticket-writing` skill for ticket content.

## system-analyst

Primary agent. Analyzes tickets against the existing codebase read-only and
presents implementation options for a user decision (`src/agents/system-analyst.md:2`).
Distinguishes evidence, facts, assumptions, risks, and recommendations; never
silently chooses between viable alternatives (`src/agents/system-analyst.md:61-74`).
Delegates to `sub-code-impact-explorer`, `sub-ticket-context-reader`, and
`sub-researcher`; denies shell and other subagents. Its only write permission is
the explicit bookmark directory `.ai-temp/system-analyst/**`
(`src/agents/system-analyst.md:160-185`). Output must stay
at architectural and design analysis level: no production code, diffs, or
implementation-ready patches (`src/agents/system-analyst.md:42-74`). Asks the user
for explicit permission before delegating web research to the `sub-researcher`
subagent (`src/agents/system-analyst.md:74`). Resolves the output language from the
project context (existing ticket, `README*`, recent tickets, `docs/`) via the
`ticket-writing` skill and asks only when it cannot be determined
(`src/agents/system-analyst.md:72`). Can create technical tickets on request,
with a draft-mode question before creation (`src/agents/system-analyst.md:388-398`).

## Analyst bookmarks

The two analysts share one persistence contract but never share a bookmark
directory. `issue-save <name>` writes only when the user explicitly invokes it
while that analyst is active. `issue-list` reads only the same analyst's regular
`*.md` files, and `issue-load <name>` restores the compact projection and its
`Next action`. A missing, unknown, or non-analyst active role stops all file
access.

Bookmark names are 1-64 characters and accept only letters, digits, `_`, and `-`
after an initial letter or digit. Overwrite requires confirmation. Legacy
`.ai-temp/business-analyst.yaml` and `.ai-temp/system-analyst.yaml` files are
ignored and are not migrated. The project glossary cache remains independent.
Source: `src/agents/_shared/state-persistence.md:7-141` and
`src/commands/issue-save.md`.

## coder

Primary agent. Implements an approved ticket from its functional requirements
and selected technical direction, then verifies the change
(`src/agents/coder.md:2`). Has full edit and shell access except `git push`, which
requires a prompt (`src/agents/coder.md:7-15`). Does not own product discovery or
technical direction, and does not commit, push, or deploy without explicit
request (`src/agents/coder.md:25`). On explicit request it commits with the
[commit skill](skills-reference.md#commit) and opens pull requests with the
[pull-request skill](skills-reference.md#pull-request), never bypassing their
confirmation gates (`src/agents/coder.md:82-97`).

## sub-code-impact-explorer

Subagent (hidden). Read-only codebase discovery for the System Analyst; maps
likely implementation impact without designing a solution
(`src/agents/sub-code-impact-explorer.md:2`). Denies edit, shell, and subagents.

## sub-ticket-context-reader

Subagent (hidden). Read-only ticket and discussion retrieval for the Business
Analyst; returns a compact, evidence-led business summary
(`src/agents/sub-ticket-context-reader.md:2`). Denies edit, shell, and subagents.

## sub-docs-glossary-reader

Subagent (hidden). Resolves a single unknown product/domain term from `docs/`,
returning the term definition plus only the related terms strictly needed,
with hard output caps (`src/agents/sub-docs-glossary-reader.md:2`). Read and glob are
restricted to `docs/**`; edit and shell are denied.

## sub-docs-topic-reader

Subagent (hidden). Read-only documentation subagent that returns only the
documented content relevant to one requested topic
(`src/agents/sub-docs-topic-reader.md:2`). Read and glob are restricted to `docs/**`;
edit and shell are denied.

## sub-universal-code-reviewer

Subagent (hidden). Reviews code in any language for bugs, security,
performance, and maintainability within the requested scope
(`src/agents/sub-universal-code-reviewer.md:2-3`). It may read code and adjacent
documentation and load a matching review skill, but denies edit, shell, and
subagents. It returns findings only and never implements fixes
(`src/agents/sub-universal-code-reviewer.md:28-30`).

## documenter

Primary agent. Generates or updates project technical documentation for any
repository, typically Python/uv projects, using the documented taxonomy and
checks (`src/agents/documenter.md:3`). Loads the
[documentation skill](skills-reference.md#documentation) and proposes a
structure for approval before writing (`src/agents/documenter.md:90-99`). Write
surface is strictly limited to `docs/**`, `README*`, and
`properdocs.yml`/`properdocs.yaml`; shell access is limited to
`uv run properdocs` and `properdocs` (`src/agents/documenter.md:29-37`).

## sub-researcher

Subagent (hidden). Searches the web for libraries, frameworks, tools, patterns,
and technical solutions to address a given problem (`src/agents/sub-researcher.md:2`).
Read-only: denies edit, shell, and subagents; allows websearch and webfetch
(`src/agents/sub-researcher.md:7-22`). Called by the System Analyst when a design option
would benefit from external solutions not yet in the project. The System Analyst
must ask the user for explicit permission before delegating web research
(`src/agents/system-analyst.md:65`). Returns structured findings with verified URLs,
pros/cons, and fit classification per solution category
(`src/agents/sub-researcher.md:49-74`).

## Permissions at a glance

| Agent | Edit | Shell | Subagents |
|---|---|---|---|
| business-analyst | `.ai-temp/business-analyst/**`, glossary cache | deny | 3 named readers |
| system-analyst | `.ai-temp/system-analyst/**` only | deny | `sub-code-impact-explorer`, `sub-ticket-context-reader`, `sub-researcher` |
| coder | allow | allow (push: ask) | deny |
| sub-code-impact-explorer | deny | deny | deny |
| sub-ticket-context-reader | deny | deny | deny |
| sub-docs-glossary-reader | deny | deny | deny |
| sub-docs-topic-reader | deny | deny | deny |
| sub-universal-code-reviewer | deny | deny | deny |
| documenter | `docs/**`, `README*`, `properdocs.{yml,yaml}` | `uv run properdocs *`, `properdocs *` only | deny |
| sub-researcher | deny | deny | deny |

## Next steps

- End-to-end flows: [Agent workflows](../user-guide/workflows/agents.md).
- Permissions format: [Configuration reference](../admin/configuration.md).