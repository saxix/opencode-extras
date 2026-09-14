# step-by-step

Deconstructs a task into an idempotent sequential plan (`README.md:71`).

## Details

| Field | Value |
|---|---|
| Frontmatter | none (runs on the TUI default agent) |
| Input | The task through `$ARGUMENTS` |

## Constraints

The command body forces the plan to (`commands/step-by-step.md:3-9`):

1. State all prerequisites and environment assumptions first.
2. Give each numbered step exactly one actionable command, operation, or code
   modification.
3. After every critical step, include an explicit verification check to
   confirm success.
4. Flag irreversible operations or pitfalls before they occur.

## Example inputs

- "Deploy this service to staging"
- A multi-step development task pasted as `$ARGUMENTS`