---
name: push
description: Stage changes, run tox validation, generate a commit message, and push to the remote repository. Stops if tox fails.
---

# Push Code to Remote

Follow these steps to stage, validate, commit, and push changes. **Stop immediately if any step fails.**

## Phase 1: Check Status & Stage Changes
1. Inspect working directory and branch state:
   `git status`
2. Stage all working changes and untracked files:
   `git add .`

## Phase 2: Validate Code Quality & Tests
1. Run linting and test suites using `tox`:
   `tox`
2. **CRITICAL:** Check the exit status of `tox`.
   - If `tox` returns errors or failures, **STOP HERE**. Do not commit or push. Report the test/lint failures to the user so they can fix them.
   - If `tox` succeeds, proceed to Phase 3.

## Phase 3: Generate Commit Message & Commit
1. **Generate Commit Message:** Invoke the `commit-message` skill to craft an appropriate commit message based on the staged changes.
2. Commit the staged changes using the generated message:
   `git commit -m "<generated-message>"`

## Phase 4: Push Changes
1. Push to remote (setting upstream if on a new branch):
   `git push -u origin HEAD`
