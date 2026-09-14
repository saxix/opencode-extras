---
name: upgrade
description: Audit python dependencies in pyproject.toml using uv and tox, upgrade packages one by one, and verify stability. Triggers on "sax upgrade", "upgrade dependencies", "audit security dependencies".
---

# Dependency Security & Bug Upgrade Flow (`uv` + `pyproject.toml`)

Iteratively inspect `pyproject.toml` dependencies, upgrade vulnerable or outdated packages one at a time using `uv`, run stability checks, and log items requiring architectural decisions.

---

## Phase 1: Security & Dependency Audit
1. Run the security audit environment:
   `tox -e security`
2. **Collect Vulnerable & Outdated Packages:**
   - Parse stdout/logs from `tox -e security` to identify flagged dependencies.
   - Inspect outdated dependencies managed via `uv`:
     `uv tree --outdated` or `uv pip list --outdated`
3. Build a target queue of packages to upgrade. If no vulnerabilities or outdated packages are found, report that all dependencies are up to date and exit.

---

## Phase 2: Iterative Single-Package Upgrade Loop
Maintain two tracking lists throughout execution:
- `UPGRADED_PACKAGES`: List of successfully updated packages with old $\rightarrow$ new version changes.
- `USER_FEEDBACK_NEEDED`: List of packages where upgrades broke stability and required deep structural changes.

For **each package** in the audit queue:

### Step 2.1: Apply Single Upgrade via `uv`
1. Upgrade **only ONE** target package in `pyproject.toml` using `uv`:
   `uv add "<package_name>@latest"`
   *(Or if syncing lockfile/dependencies directly: `uv lock --upgrade-package <package_name>`)*
2. Refresh the virtual environment using `uv`:
   `uv sync`

### Step 2.2: Test & Stability Verification
1. Run full test suite and quality checks:
   `tox`
2. **Evaluate Exit Status:**
   - **If tox passes cleanly (Exit code 0):**
     - Record the package in `UPGRADED_PACKAGES`.
     - Stage `pyproject.toml` and `uv.lock`:
       `git add pyproject.toml uv.lock`
     - Move to the next dependency in the queue (Step 2.1).
   - **If tox fails (Exit code != 0):**
     - Proceed to Step 2.3 for error resolution.

### Step 2.3: Error Resolution & Threshold Check
1. **Attempt Minimal Fixes:**
   - If failures are simple (e.g., deprecated imports, minor syntax/type updates, or formatting changes), apply targeted fixes directly.
   - Re-run `tox` to verify if the fix resolves the breakage.
2. **Decision Gate:**
   - **Minimal change required & fixed:** Record package in `UPGRADED_PACKAGES`, stage changes (`git add pyproject.toml uv.lock <fixed_files>`), and proceed to the next dependency.
   - **Deep structural/design changes needed:** 
     - Revert local changes made during this package's attempt:
       `git checkout -- pyproject.toml uv.lock .`
     - Mark this package as `"user-feedback-needed"` and record a concise summary of the breaking error/required refactoring.
     - Skip this package and proceed to the next dependency in the queue.

---

## Phase 3: Audit Summary & Final Reporting
When all targeted dependencies in the queue have been processed, output a structured summary report on screen:

```markdown
# Dependency Upgrade Summary Report (`uv` + `pyproject.toml`)

## Successfully Upgraded Packages
- <package_A>: <old_version> -> <new_version>
- <package_B>: <old_version> -> <new_version>

## Marked as "user-feedback-needed"
- **<package_C>**
  - **Attempted Target:** <target_version>
  - **Issue Summary:** <short description of the breaking change/failing test>
  - **Required Action:** <architectural change, config setting, or deep refactoring required>
