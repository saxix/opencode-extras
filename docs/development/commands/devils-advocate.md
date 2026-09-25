# devils-advocate

Runs an adversarial review of a proposal as a skeptical reviewer
(`README.md:143`).

## Details

| Field | Value |
|---|---|
| Frontmatter | none (runs on the TUI default agent) |
| Input | The proposal through `$ARGUMENTS` |

## Constraints

The command body forces the review to (`commands/devils-advocate.md:3-10`):

1. Identify unstated assumptions, operational overhead, and silent trade-offs.
2. Detail worst-case failure modes (scale, latency, edge cases, human error).
3. Propose the strongest counter-strategy or alternative design.
4. Provide concrete, technically grounded counterarguments rather than generic
   cautions.

## Example inputs

- "We should move the batch job to serverless functions"
- A full design proposal pasted as `$ARGUMENTS`