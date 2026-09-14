---
description: Explain what the pending git changes are trying to do
---

Explain, in plain words, what the pending changes in this repository are
trying to achieve. Focus on the intent, not on the file list.

Run these read-only diagnostics first (never modify, commit, or push):

- `git status --short` -- which files are staged, unstaged, or untracked
- `git log --oneline -5` -- recent history for context
- `git diff` and `git diff --staged` -- the actual changes to read

Read the diffs, not only the file names. Identify the intent behind the
changes: is this a feature, a bug fix, a refactor, a documentation update, a
configuration change? Group the files that serve a single purpose into one
explanation.

Then write a report:

## What the pending changes are trying to do

<one short paragraph: the overall intent behind the work in progress>

### Change 1 -- <short title>

- Goal: what it is trying to achieve, in plain words
- Evidence: the key behaviors or lines in the diff that show that goal
- Files involved: path list only, no per-file descriptions

(One section per distinct purpose. Omit file-by-file descriptions entirely.)

### Things to check before committing

- <anything risky, surprising, unfinished, or conflicting; secrets, dead code;
  or "None">

Rules:

- Focus on intent: one section per purpose, no file inventory.
- Base every statement on what the diff actually shows; do not guess.
- Flag anything that looks like a secret or credential.
- Report only: do not stage, commit, push, or change branches.
- If the working tree is clean, say so in one line and stop.

Scope: $ARGUMENTS