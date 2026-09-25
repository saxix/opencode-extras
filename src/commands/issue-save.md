---
description: Save the active analyst's current ticket work as a named bookmark
---

Save the current ticket work as a compact analyst bookmark.

Requested input: `$ARGUMENTS`
First positional argument: `$1`

## Active-agent guard

Before using any read, glob, or edit tool, determine the active role from the
current session's loaded agent identity.

- Continue only if the active role is exactly `business-analyst` or
  `system-analyst`.
- If the active role is another agent or cannot be identified without guessing,
  stop without reading, globbing, creating, changing, or deleting any file.
- Report that this command is restricted to `business-analyst` and
  `system-analyst`.
- Never treat the requested input as an agent identity.

## Resolve the bookmark

1. If the first positional argument is absent, ask one question:
   `What bookmark name should I use?` Do not save anything before receiving a
   valid answer.
2. Accept exactly one name matching `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$`.
   Reject whitespace, path separators, dots, control characters, and path
   traversal. Ask one corrective question if the name is invalid.
3. Resolve the directory from the verified active role:
   - `business-analyst` -> `.ai-temp/business-analyst/`
   - `system-analyst` -> `.ai-temp/system-analyst/`
4. Set the target to `<directory>/<name>.md`. Never inspect the other analyst's
   directory.

## Save

1. If there is no current ticket work in conversation context, say there is
   nothing to save and create no file.
2. Check whether the exact target already exists. If it does, ask for explicit
   confirmation before replacing it. A refusal or ambiguous answer must leave
   the file unchanged.
3. Project only the current, compact resume state for the active analyst. Use
   this frontmatter and omit unnecessary body sections:

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

Before writing, validate the filename, bookmark, agent, schema version, title,
nullable fields, status, and `saved_at` against the shared contract. Serialize
all non-null string values as valid YAML double-quoted scalars; escape quotes,
backslashes, control characters, and YAML-significant text. Never write a raw
title, ticket reference, or language into frontmatter.

Use the current date or timestamp exposed by the environment. If no time is
available, use the current `YYYY-MM-DD` date; never invent a time.

The Business Analyst projection contains the current ticket identity, language,
problem and desired outcome, in/out scope, confirmed requirements and acceptance
criteria, unresolved questions, material assumptions or risks, and the next
question or action.

The System Analyst projection contains the current ticket identity, language,
technical goal and constraints, material repository evidence as stable
`path/to/file -- symbol` references, concise impact, options and selected
direction when known, validation plan, unresolved questions, material
assumptions or risks, and the next action.

Never include the complete internal model, conversation transcript, ticket
discussion history, tool output, code, diffs, production configuration, or
operational logs. Summarise current facts rather than preserving their history.

After a successful write, reply in one line with the saved path and state. Do not
save, modify, or delete anything else.
