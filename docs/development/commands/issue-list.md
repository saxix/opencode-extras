# issue-list

Lists ticket bookmarks belonging to the active analyst
(`commands/issue-list.md:2`).

## Details

| Field | Value |
|---|---|
| Frontmatter | `description:` List ticket bookmarks belonging to the active analyst |
| Agent | Current session; must resolve to `business-analyst` or `system-analyst` |
| Input | None |

## Eligibility

Before using a read or glob tool, the command verifies that the current
session's loaded agent is exactly `business-analyst` or `system-analyst`. Any
other or unknown role stops without reading or changing files. The active role
must come from session metadata, never from user claims or bookmark contents.

## Behavior

1. Resolve only the active analyst's bookmark directory.
2. Inspect regular `*.md` files directly inside it without recursion.
3. Read frontmatter only and apply the same validity rules as `issue-load`:
   filename/name, active agent, schema version, required values, analyst status,
   and ISO 8601 save time. Never coerce or repair an invalid value.
4. Sort valid bookmarks by `saved_at`, newest first.
5. Return a narrow table with `Name`, `Ticket`, `Title`, `Status`, and `Saved`.
6. Mark an unreadable or malformed file as `invalid` without repairing it.
7. If the directory is missing or empty, report that no bookmarks were found
   and do not create the directory.

The command never inspects the other analyst's directory or the project
glossary cache. Listing is read-only: it never saves, modifies, renames, or
deletes a file.

## Related

- [Save a bookmark](issue-save.md)
- [Load a bookmark](issue-load.md)
- [Analyst bookmark contract](../agents-reference.md#analyst-bookmarks)
