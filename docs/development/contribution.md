# Contribution guidelines

Who is this for? This page defines how to author or change agents, skills, and
commands in this repository.

## General rules

- Every artifact is plain Markdown with YAML frontmatter.
- Every skill MUST have a `SKILL.md` at its directory root (`AGENTS.md:97`).
- Agents and commands require `description:` frontmatter; other fields
  (`agent`, `mode`, `color`, `steps`, `permissions`) are optional opencode
  settings (`AGENTS.md:99`).
- Rules live in only one place. For example, the
  [documenter agent](../development/agents-reference.md#documenter) owns the
  docs workflow, while the [documentation skill](../development/skills-reference.md#documentation)
  owns the domain knowledge; do not duplicate the content (`AGENTS.md:114-116`).

## Authoring a skill

1. Create `skills/<name>/SKILL.md`.
2. Frontmatter: `name` (lowercase, hyphen-separated) and `description`
   required; the description must front-load the literal trigger keywords the
   user is likely to say, gated with "Use ONLY when..." if the skill should
   stay quiet on adjacent topics.
3. Optional frontmatter: `license`, `compatibility`, `metadata` (string-string
   map).
4. Add reference material in named subdirectories (for example `references/`,
   `languages/`) when a single file would grow too large.

## Authoring an agent

1. Create `agents/<name>.md` with `description:` and `mode:` (primary or
   subagent).
2. Give the agent an explicit role statement, an operating contract, and, for
   primary agents, a state machine and a handoff/report format (pattern
   visible in `agents/coder.md`).
3. Declare `permissions` with the deny-first, allow-last convention: a broad
   `*` deny rule before narrow allow rules
   ([configuration reference](../admin/configuration.md)).
4. For subagents, prefer read-only access: deny `edit` and `shell`, restrict
   `read`/`glob` to the needed scope (`agents/sub-docs-topic-reader.md`).

## Authoring a command

1. Create `commands/<name>.md`.
2. Optionally set `description:` and `agent:` (for example
   `commands/debug-code.md:3`). Without frontmatter the command runs on the TUI
   default agent.
3. The body is the prompt executed with `$ARGUMENTS` as the user input.
   Constrain it with numbered requirements (pattern:
   `commands/step-by-step.md`).

## The TUI-portable output standard

Any template or output an artifact prescribes must follow the standard in
`AGENTS.md:118-131`:

- Plain CommonMark only: no raw HTML, no custom containers or admonitions. Use
  Mermaid fenced code blocks only when the user asks for a diagram or chart.
  When a Mermaid diagram appears inside a ticket body, use the same language as
  the ticket.
- ASCII-first charset: no emoji, box-drawing glyphs, arrows, or dingbats.
  Prefer `--` over the em-dash and `->` over the arrow.
- ATX headings (`##`, `###`); avoid setext headings and a lone `#` in section
  bodies.
- Fenced code blocks with a language tag; avoid indented code blocks.
- Short bullets and narrow tables; keep lines under about 100 characters.
- Self-contained evidence: inline `path/to/file:line` references rather than
  relative links the reader may not have open.
- Escape literal special characters that could be parsed as formatting.
- No TUI-specific directives: no tool-call syntax, slash-command references,
  or keybind hints meant for a single TUI.

## Documentation

- The docs site in this repository follows the taxonomy owned by the
  [documentation skill](../development/skills-reference.md#documentation):
  four guides (User, Administrative, Development, Deploy) plus shared landing
  and glossary.
- The [documenter agent](../development/agents-reference.md#documenter)
  generates or updates docs under an approval gate and may write only
  `docs/**`, `README*`, and `properdocs.yml`/`properdocs.yaml`
  (`agents/documenter.md:45-51`).
- Keep documentation changes in the same changeset as the definitions they
  describe.

## Definition of done

- [ ] Frontmatter valid (`description:` present; `SKILL.md` where required).
- [ ] Output standard respected.
- [ ] Permissions declared deny-first and minimal.
- [ ] Docs updated for any configuration, field, or permission change.

## Next steps

- Where things live: [Codebase structure](structure.md).
- Config details: [Configuration reference](../admin/configuration.md).