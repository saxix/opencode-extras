# humanize

Rewrites text without corporate or AI markers (`README.md:68`).

## Details

| Field | Value |
|---|---|
| Frontmatter | none (runs on the TUI default agent) |
| Input | The text to rewrite through `$ARGUMENTS` |

## Constraints

The command body forces the rewrite to (`commands/humanize.md:3-9`):

1. Strip all corporate throat-clearing, meta-announcements, and formulaic
   conclusions.
2. Ban AI markers: "delve", "testament", "tapestry", "crucial", "foster",
   "landscape", "leverage".
3. Vary sentence lengths; combine short punches with compound structures.
4. Use direct, active voice and concrete examples over abstract modifiers.

## Example inputs

- A paragraph from a README or changelog
- An email draft pasted as `$ARGUMENTS`