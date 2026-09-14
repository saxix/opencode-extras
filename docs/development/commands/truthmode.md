# truthmode

Applies strict empirical rigor and epistemic calibration (`README.md:72`).

## Details

| Field | Value |
|---|---|
| Frontmatter | none (runs on the TUI default agent) |
| Input | A claim, question, or statement through `$ARGUMENTS` |

## Constraints

The command body forces the response to (`commands/truthmode.md:3-9`):

1. Never guess, flatter, or hallucinate missing details; state gaps explicitly.
2. Separate verifiable facts from consensus and speculative extrapolations.
3. Assign confidence levels (High, Moderate, Low/Speculative) to key
   assertions.
4. Highlight boundary conditions where the premise breaks down.

## Example inputs

- "Is feature X ready for production?"
- A technical claim pasted as `$ARGUMENTS`