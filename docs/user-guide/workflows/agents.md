# Agent workflows

Who is this for? This page describes the end-to-end workflows that the primary
agents automate, so you know which agent to call and what to expect.

## The ticket pipeline

The three primary agents form a verification pipeline from idea to shipped
change:

| Stage | Agent | Produces |
|---|---|---|
| 1. Discovery | [Business Analyst](../../development/agents-reference.md#business-analyst) | Approved, ready-to-create functional ticket |
| 2. Design | [System Analyst](../../development/agents-reference.md#system-analyst) | Implementation options and a chosen direction |
| 3. Implementation | [Coder](../../development/agents-reference.md#coder) | Verified code change |

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
- It may consult `README*` and `docs/` for product terminology and relies on
  the [sub-docs-glossary-reader](../../development/agents-reference.md#sub-docs-glossary-reader)
  and [sub-docs-topic-reader](../../development/agents-reference.md#sub-docs-topic-reader)
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
  [sub-code-impact-explorer](../../development/agents-reference.md#sub-code-impact-explorer)
  and [sub-ticket-context-reader](../../development/agents-reference.md#sub-ticket-context-reader)
  subagents (`agents/system-analyst.md:31-39`).
- It may always inspect documentation and usage patterns of libraries already
  installed in the project (local research, no permission needed).
- Before searching the web for new libraries, frameworks, tools, or external
  patterns via the [researcher](../../development/agents-reference.md#sub-researcher)
  subagent, it asks you for explicit permission
  (`agents/system-analyst.md:74`).
- Output must stay at architectural and design analysis level: no production
  code, diffs, or implementation-ready patches
  (`agents/system-analyst.md:42-74`).

Choose a direction; the System Analyst then prepares the implementation handoff
for the Ticket Implementer.

### Pause and resume analyst work

The Business Analyst and System Analyst keep the full working model in the
current conversation. They do not autosave it. To move work across sessions,
run one of the bookmark commands while the relevant analyst is the active agent:

- [`issue-save <name>`](../../development/commands/issue-save.md) writes a compact
  resume state under that analyst's `.ai-temp/` directory;
- [`issue-list`](../../development/commands/issue-list.md) lists only that
  analyst's bookmarks, newest first;
- [`issue-load <name>`](../../development/commands/issue-load.md) restores the selected
  bookmark and continues from its next action.

The commands stop without reading or changing files if the active agent is not
exactly `business-analyst` or `system-analyst`. Natural-language requests do
not trigger persistence, and the analysts cannot inspect each other's bookmarks.

### 3. Coder -- implement and verify

The [Coder](../../development/agents-reference.md#coder) implements the approved
ticket from its functional requirements and the selected direction, then
verifies the change (`agents/coder.md:21-23`). It reports changes, verification,
and residual risks, and does not commit, push, or deploy without an explicit
request.

## Documentation workflow

When a project's documentation needs to be created or updated, ask the
[documenter agent](../../development/agents-reference.md#documenter) to "generate
docs" or "update the documentation". The Documenter:

1. Loads the [documentation skill](../../development/skills-reference.md#documentation)
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
- Read the full contract of any agent: [Agent reference](../../development/agents-reference.md).