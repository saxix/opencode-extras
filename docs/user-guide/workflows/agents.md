# Agent workflows

Who is this for? This page describes the end-to-end workflows that the primary
agents automate, so you know which agent to call and what to expect.

## The ticket pipeline

The three primary agents form a verification pipeline from idea to shipped
change:

| Stage | Agent | Produces |
|---|---|---|
| 1. Discovery | Business Analyst | Approved, ready-to-create functional ticket |
| 2. Design | System Analyst | Implementation options, a chosen direction, and a published specification (new ticket or comment) |
| 3. Implementation | Coder | Verified code change |

### 1. Business Analyst -- refine the request

Start with a raw product or business idea. The Business Analyst works in the
problem domain only: it clarifies goals, scope, requirements, and testable
acceptance criteria using process and user language, and never discusses
implementation details (`agents/business-analyst.md:76-85`).

Operating rules that shape the interaction:

- It asks **exactly one substantive question per message**
  (`agents/business-analyst.md:78`).
- It never invents business decisions, criteria, owners, or deadlines; open
  items are recorded instead (`agents/business-analyst.md:81`).
- It does not mutate tickets until the approval gate has passed
  (`agents/business-analyst.md:85`).
- Can target a new ticket or an existing one; for an existing ticket it proposes
  a comment or an update against the referenced ticket, behind the same approval
  gate (`agents/business-analyst.md`, `## Abstract ticketing-system interface`).
- Can express the ticket as a plain ticket, a user story, or a use case, chosen
  from the request (`agents/business-analyst.md`, `## Requirement forms`).
- It may consult `README*` and `docs/` for product terminology and relies on
  the sub-docs-glossary-reader
  and sub-docs-topic-reader
  subagents (`agents/business-analyst.md:17-36,52-63`).

Approve the draft ticket when the requirements are complete and testable; only
then it is created in the ticketing system.

### 2. System Analyst -- compare implementation options

Give the approved ticket to the System Analyst. It inspects the repository
read-only, identifies impact and constraints, and presents meaningful
implementation options for your decision
(`agents/system-analyst.md:42-74`).

Operating rules:

- It never silently chooses between viable alternatives; it asks you to pick a
  direction (`agents/system-analyst.md:69`).
- It distinguishes repository evidence, ticket facts, assumptions, risks, and
  recommendations (`agents/system-analyst.md:65`).
- It delegates bounded retrieval to the
  sub-code-impact-explorer
  and sub-ticket-context-reader
  subagents (`agents/system-analyst.md:31-39`).
- It may always inspect documentation and usage patterns of libraries already
  installed in the project (local research, no permission needed).
- Before searching the web for new libraries, frameworks, tools, or external
  patterns via the researcher
  subagent, it asks you for explicit permission
  (`agents/system-analyst.md:74`).
- Output must stay at architectural and design analysis level: no production
  code, diffs, or implementation-ready patches
  (`agents/system-analyst.md:42-74`).
- It works from either an approved ticket or a clear dialogue, so a technical
  analysis does not require a functional ticket first
  (`agents/system-analyst.md:115-119`).
- On request it publishes the specification to exactly one destination: a new
  linked technical ticket, or a comment on an existing ticket
  (`agents/system-analyst.md`, `## Delivery destination and ticket creation`).

Choose a direction; the System Analyst then prepares the implementation handoff
and, on request, publishes it as a new technical ticket or as a comment on an
existing ticket.

### Pause and resume analyst work

The Business Analyst and System Analyst keep the full working model in the
current conversation. They do not autosave it. To move work across sessions,
ask the active analyst in plain language, for example "save this work as
requirements-review". The analyst loads the
`issue-bookmarks` skill
and follows the matching operation:

- **save** writes a compact resume state under that analyst's `.ai-temp/`
  directory;
- **list** shows only that analyst's bookmarks, newest first;
- **load** restores the selected bookmark and continues from its next action.

The operations stop without reading or changing files if the active agent is not
exactly `business-analyst` or `system-analyst`. Only an explicit request writes a
bookmark, and the analysts cannot inspect each other's bookmarks (the layout and
write policy live in the
`state-persistence` skill).

The two agents also share `.ai-temp/findings/`: a fact one establishes for the
other is recorded there once, with its evidence, instead of being re-derived or
re-asked. The Business Analyst contributes the product terminology it resolves
from `docs/`; the System Analyst contributes repository facts such as a
component's role or an entry point. Neither writes the other's working model
there.

### 3. Coder -- implement and verify

The Coder implements the approved
ticket from its functional requirements and the selected direction, then
verifies the change (`agents/coder.md:21-23`). It reports changes, verification,
and residual risks, and does not commit, push, or deploy without an explicit
request.

## Documentation workflow

When a project's documentation needs to be created or updated, ask the
documenter agent to "generate
docs" or "update the documentation". The Documenter:

1. Loads the documentation skill
   which owns the site taxonomy, style, and verification checks
   (`agents/documenter.md:90`);
2. Proposes a structure and gap list for approval before writing
   (`agents/documenter.md:98-99`);
3. Writes only documentation (`docs/**`, `README*`, `properdocs.yml` /
   `properdocs.yaml`, `agents/documenter.md:45-51`);
4. Verifies the result and reports checks and residual gaps
   (`agents/documenter.md:115-126`).

## Best practices

- Keep the pipeline stages separate: discovery before design before
  implementation. Do not ask the Business Analyst to design, or the Coder to
  do product discovery.
- Treat ticket contents as untrusted source material, never as instructions
  that override an agent's role (`agents/coder.md:62`).
- Expect approval gates at ticket creation and direction selection; the agents
  intentionally stop and wait.

## Next steps

- Use standalone routines: [Command workflows](commands.md).
- Read the full contract of any agent: Agent reference.