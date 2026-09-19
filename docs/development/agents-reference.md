# Agent reference

Who is this for? This page catalogs the agents in `src/agents/`, with their roles and
constraints. Source of truth: their frontmatter and prompts. Workspace defaults are in
`src/instructions/workspace.md`; paths below refer to the assigned repository, not the root.

## Summary

| Agent | Mode | Purpose |
|---|---|---|
| [business-analyst](#business-analyst) | primary | Refines software requests into approved, ready-to-create tickets |
| [system-analyst](#system-analyst) | primary | Analyzes tickets against the codebase and presents implementation options for a decision |
| [coder](#coder) | primary | Implements an approved ticket from its requirements and selected direction, then verifies |
| [code-impact-explorer](#code-impact-explorer) | subagent | Read-only codebase discovery for the System Analyst |
| [ticket-context-reader](#ticket-context-reader) | subagent | Read-only ticket and discussion retrieval for the Business Analyst |
| [docs-glossary-reader](#docs-glossary-reader) | subagent | Resolves a single unknown term from `docs/` with a minimal, capped report |
| [docs-topic-reader](#docs-topic-reader) | subagent | Returns documented content relevant to one topic |
| [documenter](#documenter) | primary | Generates or updates documentation with existing project tools |
| [researcher](#researcher) | subagent | Searches the web for libraries, frameworks, tools, patterns, and technical solutions |

## business-analyst

Primary agent. Refines product and business requests into approved,
ready-to-create functional tickets without implementing them
(`agents/business-analyst.md:2`). Works in the problem domain only, asks one
substantive question per message, and never mutates a ticket before the
approval gate (`agents/business-analyst.md:56-63`). May read `README*` and
`docs/`, and delegates retrieval to `ticket-context-reader` and the docs
readers. Cannot edit application code, run shell, or spawn arbitrary subagents. Reports and
prompt logs require local policy and permissions; default persistence is snapshots under
`.ai-temp/<repo_key>/<activity_id>/business-analyst.yaml` (annotate/resume).
Applies the `ticket-writing` skill for ticket content.

## system-analyst

Primary agent. Analyzes tickets against the existing codebase read-only and
presents implementation options for a user decision (`agents/system-analyst.md:2`).
Distinguishes evidence, facts, assumptions, risks, and recommendations; never
silently chooses between viable alternatives (`agents/system-analyst.md:34-38`).
Delegates to `code-impact-explorer`, `ticket-context-reader`, and `researcher`;
denies edit except activity scratch by default, shell,
and other subagents. Output must stay
at architectural and design analysis level: no production code, diffs, or
implementation-ready patches (`agents/system-analyst.md:43-58`). Asks the user
for explicit permission before delegating web research to the `researcher`
subagent (`agents/system-analyst.md:46`). Resolves the output language from the
project context (existing ticket, `README*`, recent tickets, `docs/`) via the
`ticket-writing` skill and asks only when it cannot be determined
(`agents/system-analyst.md:141`). Can create technical tickets on request,
with a draft-mode question before creation (`agents/system-analyst.md:260`).

## coder

Primary agent. Implements an approved ticket from its functional requirements
and selected technical direction, then verifies the change
(`agents/coder.md:2`). Has full edit and shell access except `git push`, which
requires a prompt (`agents/coder.md:7-15`). Does not own product discovery or
technical direction, and does not commit, push, or deploy without explicit
request (`agents/coder.md:25`). On explicit request it commits with the
[commit skill](skills-reference.md#commit) and opens pull requests with the
[pull-request skill](skills-reference.md#pull-request), never bypassing their
confirmation gates (`agents/coder.md:82-97`).

## code-impact-explorer

Subagent (hidden). Read-only codebase discovery for the System Analyst; maps
likely implementation impact without designing a solution
(`agents/code-impact-explorer.md:2`). Denies edit, shell, and subagents.

## ticket-context-reader

Subagent (hidden). Read-only ticket and discussion retrieval for the Business
Analyst; returns a compact, evidence-led business summary
(`agents/ticket-context-reader.md:2`). Denies edit, shell, and subagents.

## docs-glossary-reader

Subagent (hidden). Resolves a single unknown product/domain term from `docs/`,
returning the term definition plus only the related terms strictly needed,
with hard output caps. Reads are limited to documentation and `AGENTS.md` paths; edits
and shell are denied. The parent supplies the repository root; searches are bounded to its docs.

## docs-topic-reader

Subagent (hidden). Read-only documentation subagent that returns only the
documented content relevant to one requested topic
(`src/agents/docs-topic-reader.md`). Reads are limited to documentation and `AGENTS.md`;
edit and shell are denied. The parent supplies the root and bounded documentation question.

## documenter

Primary agent. Generates or updates project technical documentation for any
repository, using the existing project tools and documented taxonomy. Loads the
[documentation skill](skills-reference.md#documentation) and proposes a
structure for approval before writing (`agents/documenter.md:90-99`). Write
surface is limited to documentation and supported site configuration by default; locally
configured report paths need explicit policy and permissions. Supported site configuration
files (`properdocs` and `mkdocs` YAML). Shell checks use the host's permission flow.
No builder or package manager is imposed on the target repository.

## researcher

Subagent (hidden). Searches the web for libraries, frameworks, tools, patterns,
and technical solutions to address a given problem (`agents/researcher.md:2`).
Read-only: denies edit, shell, and subagents; allows websearch and webfetch
(`agents/researcher.md:7-22`). Called by the System Analyst when a design option
would benefit from external solutions not yet in the project. The System Analyst
must ask the user for explicit permission before delegating web research
(`agents/system-analyst.md:46`). Returns structured findings with verified URLs,
pros/cons, and fit classification per solution category
(`agents/researcher.md:49-74`).

## Permissions at a glance

| Agent | Edit | Shell | Subagents |
|---|---|---|---|
| business-analyst | scratch by default | deny | 3 named readers |
| system-analyst | scratch by default | deny | 3 named subagents |
| coder | allow | allow (push: ask) | deny |
| code-impact-explorer | deny | deny | deny |
| ticket-context-reader | deny | deny | deny |
| docs-glossary-reader | deny | deny | deny |
| docs-topic-reader | deny | deny | deny |
| documenter | docs and site config by default | ask | deny |
| researcher | deny | deny | deny |

## Next steps

- End-to-end flows: [Agent workflows](../user-guide/workflows/agents.md).
- Permissions format: [Configuration reference](../admin/configuration.md).