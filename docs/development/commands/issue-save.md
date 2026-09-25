# issue-save

Saves the active analyst's current ticket work as a compact named bookmark
(`commands/issue-save.md:2`).

## Details

| Field | Value |
|---|---|
| Frontmatter | `description:` Save the active analyst's current ticket work as a named bookmark |
| Agent | Current session; must resolve to `business-analyst` or `system-analyst` |
| Input | Bookmark name as the first positional argument |

## Eligibility

The command verifies the current session's loaded agent before using any file
tool. It continues only when the active role is exactly `business-analyst` or
`system-analyst`. Any other or unknown role stops the command without reading,
creating, changing, or deleting files.

The verified role selects one directory:

| Active role | Target |
|---|---|
| `business-analyst` | `.ai-temp/business-analyst/<name>.md` |
| `system-analyst` | `.ai-temp/system-analyst/<name>.md` |

The command never inspects the other analyst's directory.

## Name validation

The name is required and must match `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$`.
Whitespace, path separators, dots, control characters, and path traversal are
rejected. If no name is supplied, the command asks for one and validates the
answer before any file operation.

## Behavior

1. Confirm there is current ticket work in conversation context; otherwise do
   nothing.
2. Check the exact target. If it exists, ask for explicit confirmation before
   replacement.
3. Project a compact resume state and write the selected bookmark.
4. Report the saved path and current analyst state in one line.

The projection omits unnecessary body sections but uses this frontmatter:

```markdown
---
bookmark: "<name>"
agent: "<active-analyst>"
schema_version: 1
ticket_ref: <ticket identifier or URL as a quoted string, or null>
ticket_title: "<working title, YAML-escaped>"
ticket_language: <language as a quoted string, or null>
status: "<current analyst state, YAML-escaped>"
saved_at: "<current ISO 8601 date or timestamp>"
---

## Resume summary

## Confirmed state

## Open questions, assumptions, and risks

## Next action
```

Before writing, validate every field against the shared contract. Serialize
non-null strings as valid YAML double-quoted scalars, escaping quotes,
backslashes, control characters, and YAML-significant text. A raw title,
reference, or language must never be inserted into frontmatter.

A bookmark never contains the complete internal model, transcript, ticket
discussion history, tool output, code, diffs, production configuration, or
operational logs. Analysts never autosave or persist on state transitions.

## Related

- [Load a bookmark](issue-load.md)
- [List bookmarks](issue-list.md)
- [Analyst bookmark contract](../agents-reference.md#analyst-bookmarks)
