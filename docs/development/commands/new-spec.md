# new-spec

Creates or refines a feature spec in `.specs/`
(`commands/new-spec.md:2`).

## Details

| Field | Value |
|---|---|
| Frontmatter | `description:` Create or refine a feature spec in .specs/ (provide TICKET-ID and idea for new tickets). |
| Agent | `spec` (`commands/new-spec.md:3`) |
| Input | TICKET-ID and the idea through `$ARGUMENTS` |

## Behavior

Routes the request to the spec workflow: for new tickets, provide a TICKET-ID
and the idea; for existing specs, ask for refinement. Files are resolved
inside `.specs/` at the project root (`skills/spec-write/SKILL.md:2-3`).

## Example inputs

- "TICKET-123: allow users to export invoices as PDF"
- "Refine 004 to clarify the ordering rules"

## Related

- [spec-write skill](../skills-reference.md#spec-write)
- [spec-inspect skill](../skills-reference.md#spec-inspect)