# Reviewer evaluation cases

This directory holds the reviewer evaluation cases. Each case directory is a
sample project; the harness copies it to a temporary path, builds a git
repository from it where the workflow needs one, installs the case
`opencode.jsonc` into the repository, and runs the reviewer agent against the
prepared state.

```
tests/fixtures/reviewer/
  README.md            this file
  expectations.md      the anchored expectation per case, plus the last run
  <case-dir>/
    README.md          the sample project readme
    opencode.jsonc     project config for the agent, with its permissions
    case.json          the case definitions (one or more per directory)
    hunks/<name>.hunk  the edits the harness applies, one per source file
    ...                the sample project sources
```

## Case fields

| Field | Meaning |
|---|---|
| `id` | stable case identifier |
| `workflow` | one of `clean-branch`, `working-tree`, `staged`, `pr-flow` |
| `base_branch` | base branch for a git workflow; `null` means a single branch |
| `request` | the user message sent to the agent |
| `task_file` | file drafted on the feature branch (git workflows) |
| `dirty_files` | files edited without committing (`working-tree`) |
| `base_files` | files reverted by the initial commit |
| `branch_files` | files changed on the feature branch |
| `staged_files` | files changed and staged, never committed (`staged`) |
| `expect` | substring the captured output must contain |
| `expect_any` | substrings; at least one must appear |
| `forbid_any` | substrings that must not appear |
| `expected` | one line stating the expected behaviour, for the human |

## What each workflow produces

- `clean-branch` -- the initial commit is the base branch (`main`); the harness
  checks out `feature/decimal-amounts`, drafts `task_file`, and commits the
  `branch_files`, so `git diff <base>...HEAD` has content.
- `working-tree` -- no git repository at all. The reviewer must judge the files
  on disk, so the expected issue is a line that only `pricing.py` carries.
- `staged` -- a single `main` branch; `staged_files` are applied and staged but
  never committed, so only `git diff --cached` sees them.
- `pr-flow` -- like `clean-branch`, used to check that the reviewer reports the
  absence of an open PR and never publishes a review.

## Hunk format

Hunk files under `hunks/` use the minimal marker set:

```
--- context line
-   removed line
+   added line
```

`hunks/<stem>.hunk` rewrites the source file `<stem>.py` beside it. A hunk must
apply exactly once, in order, and must change the file.

## Expectation record

Every case id and its `expected` line are duplicated in `expectations.md`, which
is what a human reads to judge a run. The live runner overwrites the results
section of that file after each run, so the same file records both the promise
and the latest evidence.
