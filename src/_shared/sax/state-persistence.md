# Shared Analyst State Layout

This file owns where analyst state may live and the policy that governs it. It
is shared by `business-analyst` and `system-analyst`, which must reference it
instead of restating the layout. It is installed at
`DEST/_shared/sax/state-persistence.md` and is neither an agent, a skill, nor a
command, so the TUI does not discover it.

Bookmark operations, schema, and validity are not described here: the
`sax-issue-bookmarks` skill is their single source of truth. This file owns the
locations those operations write to, the shared findings directory, the policy
around writing them, and the legacy state both analysts must ignore.

## State layout

All analyst state lives under `.ai-temp/` in the project root. Each analyst owns
exactly one bookmark directory, and both share the findings directory:

| Path | Owner | Permitted actions |
|---|---|---|
| `.ai-temp/business-analyst/` | `business-analyst` | read, glob, edit |
| `.ai-temp/system-analyst/` | `system-analyst` | read, glob, edit |
| `.ai-temp/findings/` | both analysts | read, glob, edit |

- Resolve every path from this table, relative to the project root, and only
  after the active agent is verified. A path outside this table is off limits.
- An analyst must never read, glob, list, write, or delete anything in the other
  analyst's bookmark directory, and must never assume the other analyst exists.
- These permissions are declared per agent in `src/agents/*.md`; this table and
  those declarations must stay in agreement.
- Create a missing directory on first write. A missing directory is not an
  error and must never be reported as one.

## Write policy

- No autosave. Keep the full working model in conversation context and never
  persist it on a material state transition.
- Only an explicit user request writes a bookmark: the `sax-issue-bookmarks`
  skill defines that projection. A shared finding is the one exception, because
  it records an observation rather than working state.
- `.ai-temp/` is git-ignored scratch. It must never be committed, treated as a
  deliverable, or published.
- Create no other temporary artifact, and keep every path under `.ai-temp/`.

## Shared findings

`.ai-temp/findings/` is the one location both analysts can read and write. It
holds durable facts that the other analyst would otherwise re-derive, so that
work survives a session change and stays in one place instead of two
conversations.

A finding is an observation with evidence, not a decision and not working
state. It may be written without asking the user, because it records something
already observed. It is never a substitute for user confirmation.

What belongs:

- A product or domain term resolved from `docs/`, with its definition and
  source.
- A documented behavior the `Business Analyst` confirmed and the `System
  Analyst` would otherwise have to ask about.
- A repository fact the `System Analyst` established and the `Business Analyst`
  would otherwise have to re-ask, such as a component's role, an entry point, or
  an environment constraint, recorded as `path/to/file -- symbol`.

What never belongs: the requirement or analysis model, a conversation
transcript, ticket discussion history, tool output, code, diffs, production
configuration, operational logs, credentials, secrets, or any content the user
must still confirm.

How to use it:

1. Read `.ai-temp/findings/` early in the session, at `INTAKE`, and again
   before asking the user about a fact that may already be recorded.
2. Never re-derive or re-ask for something already recorded there. Use it as a
   starting point, and say it comes from a shared finding.
3. Write a finding as soon as it is established, in the form its file requires.
4. Record the author, the date, and the evidence, so the other analyst can judge
   freshness.
5. When a finding is contradicted by the user or by a newer source, update it in
   place instead of adding a second entry, and note the correction.
6. Never modify the other analyst's bookmark directory to record a finding: use
   this directory.

### Layout of `findings/`

| File | Owner | Content |
|---|---|---|
| `glossary.yaml` | `business-analyst` writes, both read | The project terms cache described below |
| `<topic>.md` | either analyst | One finding note per topic |

A note file is named with a lowercase kebab-case name (`deployment`, `auth-flow`)
and uses this shape:

```markdown
---
topic: <name>
author: business-analyst | system-analyst
recorded_at: <ISO 8601 date or timestamp>
sources:
  - "docs/path.md -- heading"
  - "src/path/module.py -- function_name"
---

<the finding, in at most a few lines, stated as an observation with its evidence>
```

Keep one finding per note file, so the other analyst can read a single relevant
file instead of the whole directory. Never put an entry in a note file that
belongs in `glossary.yaml`.

### Project terms cache

`glossary.yaml` is the accumulating project glossary: terms resolved from
`docs/`, kept across sessions so they are not re-searched every time `docs/`
lacks a structured glossary. It is written by the `Business Analyst`, which is
the only analyst that can read `docs/`; the `System Analyst` reads it to
understand product terminology it cannot obtain from the repository. The key is
the canonical term; an entry looks like:

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
- The `System Analyst` never writes this file, and never creates a term entry
  for something it could not confirm from `docs/`.
- The cache is not a ticket bookmark: never list, load, or write it through the
  `sax-issue-bookmarks` skill.

## Legacy state

These paths are not part of the current layout. Ignore them: never create,
migrate, delete, list, or load them automatically.

- `.ai-temp/business-analyst.yaml` and `.ai-temp/system-analyst.yaml` are not
  bookmarks.
- `.ai-temp/glossary-known-terms.yaml` is the project terms cache before it moved
  into `findings/`. Its entries are re-resolved from `docs/` when needed; do not
  copy it into `findings/glossary.yaml` and do not treat it as the cache.
