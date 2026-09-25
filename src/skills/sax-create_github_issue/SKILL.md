---
name: sax-create_github_issue
description: Creates a new GitHub issue or ticket for bugs, enhancements, or tasks using the GitHub CLI (gh). Use this when asked to "open a ticket", "file an issue", "create a GitHub task", or report bugs/features to GitHub.
---

## Objective
Automate the creation of structured, well-formatted GitHub issues directly from the workspace via the GitHub CLI (`gh`).

---

## Prerequisites & Verification

1. Verify that `gh` is installed and authenticated:
   ```bash
   gh auth status
   ```
2. If not authenticated or not in a Git repository with a remote GitHub origin, stop and report the error to the user.

---

## Workflow Steps

### Step 1: Gather & Validate Information
Collect and structure the issue metadata before execution:
- **Title**: Short, imperative summary (e.g., `fix(api): handle connection timeout in worker pool`).
- **Body / Description**: Detailed Markdown content including:
  - Context & Motivation
  - Proposed changes / Steps to reproduce
  - Acceptance criteria / Tasks checklist
- **Labels** (optional): `bug`, `enhancement`, `documentation`, `needs-triage`, etc.
- **Assignee** (optional): GitHub username or `@me`.
- **Milestone / Project** (optional): Target milestone or project board if specified.

### Step 2: Prepare the Issue Body
To avoid escaping and multiline formatting issues in shell commands, write the body to a temporary file or pass it cleanly via stdin:

```bash
cat << 'EOF' | gh issue create --title "<ISSUE_TITLE>" --body-file - ${LABELS:+--label "$LABELS"} ${ASSIGNEE:+--assignee "$ASSIGNEE"}
## Summary
<Description>

## Motivation / Context
<Why this is needed>

## Acceptance Criteria
- [ ] Task 1
- [ ] Task 2
EOF
```

### Step 3: Execute & Output Result
- Run the command.
- Capture the returned URL of the created issue (e.g., `https://github.com/owner/repo/issues/123`).
- Return the link and issue number clearly to the user.
