# eli5

Explains a concept from first principles, assuming no prior background
(`src/commands/eli5.md:2`).

## Details

| Field | Value |
|---|---|
| Frontmatter | none (runs on the TUI default agent) |
| Input | The concept through `$ARGUMENTS` |

## Constraints

The command body forces the explanation to (`commands/eli5.md:3-8`):

1. Assume zero prior background, but avoid a childish or patronizing tone.
2. Eliminate domain jargon; define unavoidable terms by how they work
   mechanically.
3. Focus on why it works and what problem it solves.

## Example inputs

- "Explain how a database index works"
- "What is a monad?"