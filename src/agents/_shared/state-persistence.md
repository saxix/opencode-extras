# Shared State Persistence

This file owns the durable snapshot and glossary cache spec shared by `business-analyst` and `system-analyst`.
Agents must reference it instead of duplicating the spec.

## Snapshot file

Keep working state durable across sessions in one fixed snapshot file:

- **File**: `.ai-temp/<agent>.yaml` -- one file only, no `<session>` or ticket suffix. Use `.ai-temp/business-analyst.yaml` for the Business Analyst and `.ai-temp/system-analyst.yaml` for the System Analyst.
- **Content**: the current `requirement` (or analyst) model including `status` plus a top-level `session_notes` list of dated entries (`YYYY-MM-DD: <note>`), kept to the most recent 20. Save only ticket/analysis state and a few useful notes; never transcripts of the conversation.
- **Autosave**: after every material state transition, overwrite the file with the current model and add one dated note. Overwrite the model; never append except new `session_notes` entries.
- **Annotate**: on "create note" or "note draft" or "pause now", overwrite the file and reply with a one-line confirmation (path and `status`).
- **Resume**: on "resume work" or "restart from note", load the file, show a compact recap (title, language, `status`, recent `session_notes`), and continue from `status` instead of re-eliciting answered items.
- The directory is git-ignored scratch and must never be committed. The snapshot is internal working state, not the ticket or the analysis; the draft/handoff remains the approval artifact.

## Project terms cache

Maintain a separate project-scoped file at `.ai-temp/glossary-known-terms.yaml`: an accumulating project glossary shared across sessions, so terms are not re-searched every time `docs/` lacks a structured glossary. Key is the canonical term; an entry looks like:

```yaml
<term>:
  status: documented | not_found | user_confirmed
  definition: <one line; null when not_found>
  source: "docs/path.md -- heading"
  related_terms: [<co-term>, ...]
  resolved_at: <date/time ISO>
```

Rules:

- Load the file at `INTAKE`. Before delegating a term to `docs-glossary-reader`, consult it: if the entry is documented and fresh, use its definition as a documentation observation; if it is `not_found`, skip the delegation and record the limitation instead of re-searching.
- After each delegation, merge the report: the requested term (as `documented` with definition and source, or `not_found`), every co-term in `Related terms needed to understand it` that got a documented meaning, and any alias encountered. Dedup by term key, overwrite in place, latest `resolved_at` wins.
- Invalidate and re-resolve when (i) the user contradicts a cached entry -- the user correction wins and the entry becomes `user_confirmed` -- or (ii) the mtime of a `docs/` file referenced in `source` is newer than `resolved_at`.
- Entries are documentation observations, never confirmed requirements; the cache is not a substitute for user confirmation.
