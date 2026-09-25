# Shared Issue Bookmarks and Project Terms

This file owns the ticket bookmark and project glossary cache spec shared by
`business-analyst` and `system-analyst`. Agents must reference it instead of
duplicating the storage contract.

## Ticket bookmarks

Keep ticket work in conversation context until the user explicitly invokes
`issue-save`. Bookmarks are compact resume points, not session backups. Never
autosave, append session history, or persist state on material state
transitions.

### Active-analyst guard

Every bookmark command must pass this guard before using any file tool:

- Determine the active agent from the current session's agent role. Command
  arguments, file contents, and prior user claims are not proof of identity.
- Continue only when the active role is exactly `business-analyst` or
  `system-analyst`.
- If another agent is active, or the active role cannot be identified without
  guessing, stop without reading, globbing, creating, changing, or deleting any
  file. Report that the command is restricted to the two analyst agents.
- Never accept an agent name as a command argument to bypass this guard.

After the guard passes, resolve paths relative to the project root:

| Active analyst | Bookmark directory |
|---|---|
| `business-analyst` | `.ai-temp/business-analyst/` |
| `system-analyst` | `.ai-temp/system-analyst/` |

A command must never inspect the other analyst's directory.

### Name validation

The bookmark name is the basename without the `.md` suffix:

- Require exactly one name in the range 1-64 characters.
- Accept only `A-Za-z0-9` followed by zero or more `A-Za-z0-9_-` characters.
- Reject whitespace, path separators, dots, control characters, and path
  traversal. Never pass an unvalidated name to a file tool.
- If the name is absent, ask one question requesting it, then validate the
  answer before using it.

### Command behavior

- `issue-save <name>`: confirm before overwriting an existing bookmark. Project
  the active agent's current ticket state into the bookmark schema below, write
  `.ai-temp/<active-analyst>/<name>.md`, and reply with the path and current
  state. If no current ticket work exists, explain that there is nothing to save
  and create no file.
- `issue-load <name>`: read only the selected agent's named bookmark. If it does
  not exist, do not change conversation state; report that it is missing and list
  the available bookmarks for the same agent. On success, restore the current
  working context from the saved projection, show a compact recap, and continue
  from `Next action` without re-asking settled questions. Do not invent
  model-only metadata that the bookmark does not store: mark absent provenance
  as unknown or unconfirmed, and ask a question only if it blocks `Next action`.
  Do not rewrite the bookmark during load.
- `issue-list`: list only regular `*.md` files directly inside the active
  analyst's bookmark directory. Read frontmatter only, never the body. Validate
  it with the shared rules below, then show `name`, `ticket_ref`,
  `ticket_title`, `status`, and `saved_at`, newest first. If the directory is
  absent or empty, report that there are no bookmarks. Never inspect another
  analyst or the project glossary cache.

### Bookmark schema

Store one Markdown document with YAML frontmatter:

```markdown
---
bookmark: <name>
agent: business-analyst | system-analyst
schema_version: 1
ticket_ref: <ticket identifier or URL, or null>
ticket_title: <working title>
ticket_language: <language or null>
status: <current analyst state>
saved_at: <ISO 8601 date or timestamp>
---
```

Serialize every non-null string frontmatter value as a valid YAML
double-quoted scalar. Escape quotes, backslashes, control characters, and
YAML-significant text according to YAML rules. Keep `schema_version` an integer
and write literal `null` for an absent nullable value. Never insert a raw title,
reference, or language value into frontmatter.

### Bookmark validity

A bookmark is valid only when all of these checks pass:

- The filename is `<bookmark>.md`; `bookmark` is a non-empty string and matches
  the validated name.
- `agent` exactly matches the verified active analyst and `schema_version` is the
  integer `1`.
- `ticket_title` is a non-empty string; `ticket_ref` and `ticket_language` are
  either non-empty strings or literal `null`.
- `status` is one of the active analyst's state-machine states.
- `saved_at` is a valid ISO 8601 date or timestamp.

Treat any failure as invalid. Do not coerce, repair, or guess a value while
loading or listing.

Use only the body sections needed to resume:

```markdown
## Resume summary

## Confirmed state

## Open questions, assumptions, and risks

## Next action
```

Never copy the complete internal model, conversation transcript, tool output,
ticket discussion history, code, diffs,
production configuration, or operational logs. Summarise current facts; do not
preserve their history. A material unresolved limitation may be included under
`Open questions, assumptions, and risks`.

The Business Analyst projection contains the working ticket identity, language,
problem and desired outcome, current in/out scope, confirmed requirements and
acceptance criteria, unresolved questions, material assumptions or risks, and
the next question or action.

The System Analyst projection contains the working ticket identity, language,
technical goal and constraints, only material repository evidence as stable
`path/to/file -- symbol` references, concise impact, viable options and the
selected direction when known, validation plan, unresolved questions, material
assumptions or risks, and the next action.

The directory is git-ignored scratch and must never be committed or treated as a
deliverable. Legacy `.ai-temp/business-analyst.yaml` and
`.ai-temp/system-analyst.yaml` files are not bookmarks: ignore them and do not
migrate, delete, list, or load them automatically.

## Project terms cache

Maintain a separate project-scoped file at
`.ai-temp/glossary-known-terms.yaml`: an accumulating project glossary shared
across sessions, so terms are not re-searched every time `docs/` lacks a
structured glossary. The key is the canonical term; an entry looks like:

```yaml
<term>:
  status: documented | not_found | user_confirmed
  definition: <one line; null when not_found>
  source: "docs/path.md -- heading"
  related_terms: [<co-term>, ...]
  resolved_at: <date/time ISO>
```

Rules:

- Load the file at `INTAKE`. Before delegating a term to
  `sub-docs-glossary-reader`, consult it: if the entry is documented and fresh,
  use its definition as a documentation observation; if it is `not_found`, skip
  the delegation and record the limitation instead of re-searching.
- After each delegation, merge the report: the requested term (as `documented`
  with definition and source, or `not_found`), every documented co-term listed
  under `Related terms needed to understand it`, and any alias encountered.
  Dedup by term key, overwrite in place, latest `resolved_at` wins.
- Invalidate and re-resolve when (i) the user contradicts a cached entry -- the
  user correction wins and the entry becomes `user_confirmed` -- or (ii) the
  mtime of a `docs/` file referenced in `source` is newer than `resolved_at`.
- Entries are documentation observations, never confirmed requirements; the
  cache is not a substitute for user confirmation.
