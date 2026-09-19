---
name: push
description: Stage intended changes, run the repository's configured validation, commit when requested, and push to the selected remote. Use only when the user requests a push.
---

# Push Code to Remote

Follow these steps to stage, validate, commit, and push changes. **Stop immediately if any step fails.**

## Phase 1: Check Status & Stage Changes
1. Identify the repository and read its instructions. In a multi-repo workspace, operate on
   one explicitly selected repository at a time, with its working directory set on every command.
2. Inspect `git status`, `git diff`, the staged diff, recent commits, branch, and remote tracking.
   Preserve unrelated work, including already staged changes; stop if their scope is ambiguous.
3. Identify only the files belonging to the requested change. Never use blanket `git add .`.
   Stage those explicit paths after validation, including any intended validation fixes.

## Phase 2: Validate Code Quality & Tests
1. Resolve validation commands from local instructions, README, and project configuration.
   Use tox only when configured; otherwise use the existing runner and checks. For instructions-only
   repositories, use the documented static or installation checks rather than inventing tests.
2. If required validation fails or cannot run, stop and report the blocker. Do not commit or push.
3. Review and stage only the intended validated files; inspect the final staged diff.

## Phase 3: Generate Commit Message & Commit
1. If there are uncommitted intended changes and committing is authorized, use the `commit`
   skill, including its message and confirmation rules. Do not commit if the user prohibited it.
2. If the request concerns already-created commits only, skip staging and committing.
   Verify the commits to be pushed and their target; do not create an empty commit.

## Phase 4: Push Changes
1. Push to the confirmed remote and branch, setting upstream only when needed.
   Do not assume every repository uses `origin` or shares the same target branch.
2. Report per-repository validation and push outcomes. Never force-push unless explicitly requested.
