---
name: sax-commit
description: Safely stage and commit changes. Handles branch safety checks on protected branches, invokes 'sax-commit-message' to draft the message, presents a preview, and commits upon confirmation. Trigger on "commit", "make commit", "git commit".
---

## Methodology

1. **Branch Protection Check:**
   - Run `git branch --show-current` via `Bash`.
   - **If on `main`, `master`, or `develop`:**
     1. Warn the user that direct commits to base branches are restricted.
     2. Suggest a new branch name (e.g., `feat/<topic>` or `fix/<topic>`).
     3. analyse changes and find best name for new branch as `<suggested_branch>`. `<suggested_branch>` should be a ASCII only 60 chars mas name
     4. Ask: *"You are on `<current_branch>`. Would you like to create and switch to `<suggested_branch>` before committing?"*
     5. **Stop and wait for user response.** If confirmed, execute `git checkout -b <suggested_branch>`.

2. **Inspect & Stage Changes:**
   - Run `git status --porcelain`.
   - If no changes are staged, inspect `git diff` and offer to stage relevant files (`git add`).

3. **Generate Commit Message:**
   - Invoke the `sax-commit-message` skill rules to draft the commit message header, body, and footer based on `git diff --cached`.

4. **Display Preview & Request Confirmation:**
   - Present the staged summary and draft commit message:
     ```markdown
     ### Target Branch
     `<branch_name>`

     ### Staged Files
     - `path/to/staged_file.ext`

     ### Proposed Commit Message
     ```text
     <generated_commit_message>
     ```
     ```
   - Ask: *"Proceed with this commit? (Yes / Edit Message / Change Branch / Cancel)"*
   - **Stop and wait for user response.**

5. **Execute Commit:**
   - Upon explicit confirmation, run: `git commit -m "<generated_commit_message>"`
