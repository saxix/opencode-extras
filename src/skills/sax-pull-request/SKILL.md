---
name: sax-pull-request
description: Validate changes, commit, push, draft a Conventional PR description, and open a GitHub Pull Request. Decides branch name automatically from changes. Triggers on "create pr", "propose pull request", "open pr".
---

# Create Pull Request

You are a senior software engineer validating code, creating appropriate topic branches, syncing commits, and generating a clear, comprehensive Pull Request (PR) description comparing the branch against the target branch.

---

## Phase 1: Pre-Flight, Target Branch & Auto-Branching
1. Inspect working directory and branch state:
   `git branch --show-current`
   `git status`
2. **Determine Target Branch:** Detect default branch name (`main`, `master`, or `develop`):
   `git symbolic-ref refs/remotes/origin/HEAD | sed 's@refs/remotes/origin/@@'`
   *(Fallback to checking if `main` or `master` exists).*
3. **Automated Branch Name Decision:**
   - Review staged/unstaged changes: `git status -s` and `git diff --stat`
   - Classify primary intent (`feature`, `bugfix`, `refactor`, `docs`, `chore`).
   - Formulate a concise kebab-case branch name following conventional prefixes:
     - `feat/<short-summary>`
     - `fix/<short-summary>`
     - `refactor/<short-summary>`
     - `chore/<short-summary>`
4. **Branch Switch Check:**
   - If currently on the target branch (`main`/`master`/`develop`), automatically create and switch to the newly generated branch:
     `git checkout -b <generated-branch-name>`
   - If already on a feature branch, retain current branch or offer to rename if generic.

---

## Phase 2: Validate, Commit & Push (Delegate to `push`)
1. Invoke the `push` skill.
   - *Note:* The `push` skill stages changes (`git add .`), runs `tox-fix` validation/testing (halt if still errors after `tox-fix`) invokes `commit-message` for commit generation, and executes `git push -u origin <branch>`.
2. **CRITICAL:** Check the outcome of the `push` execution.
   - If `push` fails at any step (e.g., unresolvable `tox` failures or git errors), **STOP HERE**. Do not draft or create the PR.

---

## Phase 3: Analyze Changes & Draft PR Description
1. Inspect all branch changes relative to the resolved target branch (`main`, `master`, or `develop`):
   `git log <target>..HEAD`
   `git diff <target>..HEAD`
2. Classify overall intent (`Feature`, `Bug Fix`, `Refactor`, `Documentation`, `Performance`, `Chore`).
3. Draft a concise PR title using Conventional Commits notation (`type(scope): subject`).
4. Structure the PR body according to the following **Rules**:
   - **Title:** Under 70 characters, imperative mood ("add", "fix", "update"), no trailing period.
   - **Summary:** Concise bullet points covering high-level functional changes. Explain What not How.
   - **Motivation / Why:** Explain the problem solved or requirement addressed.
   - **Breaking Changes:** Explicitly call out any breaking API, schema, or structural changes.
   - **Testing Checklist:** List exact manual or automated tests executed (including passing `tox` suite).
   - **Format:** Plain Markdown using clean headers and standard ASCII text (no emojis).

---

## Phase 4: Review & User Confirmation
1. Present the generated PR Title, Branch Name, and PR Body inside a single Markdown block for user review.
2. Formulate the CLI command targeting the resolved base branch:
   `gh pr create --base <target> --title "<PR_TITLE>" --body "<PR_BODY>"`
3. **Ask the user for explicit confirmation** before opening the PR.

---

## Phase 5: Create Pull Request
1. Upon user confirmation, verify `gh` CLI authentication:
   `gh auth status`
2. Execute the `gh pr create` command to open the Pull Request on GitHub.
3. Output the generated PR URL and summary confirmation to the user.
