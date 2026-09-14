---
name: release
description: Generate release notes and create a GitHub release by comparing current HEAD with the latest tag. Trigger on "create release" or "show release".
---

## Methodology

1. **Identify Tag Boundary:**
   - Run `git describe --tags --abbrev=0` via `Bash` to find the latest Git tag.
   - Fall back to the initial commit if no tags exist in the repository.

2. **Extract & Categorize Changes:**
   - Fetch commits: `git log <latest_tag>..HEAD --oneline --no-merges`
   - Fetch diff metrics: `git diff <latest_tag>..HEAD --stat`
   - Group changes into clear Markdown sections:
     - **Features** (`feat`)
     - **Bug Fixes** (`fix`)
     - **Maintenance & Refactoring** (`chore`, `refactor`, `deps`)
     - **Breaking Changes**

3. **Branching Execution:**

   - **If user asked to "show release":**
     1. Display the formatted release description preview.
     2. Ask the user for confirmation: *"Would you like to proceed with creating this GitHub release? (Yes/No)"*
     3. **Stop and wait for user response.** Do not execute release creation until explicitly confirmed.

   - **If user confirms OR directly requested "create release":**
     1. Prompt for or determine the new tag name (e.g., `vX.Y.Z`).
     2. Create and publish the release via GitHub CLI:
        `gh release create <new_tag> --title "<new_tag>" --notes "<release_notes>"`
