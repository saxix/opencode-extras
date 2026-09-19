---
name: tox-fix
description: Run tox tests and linting, analyze any failures, automatically fix code/formatting errors, and re-run until all checks pass. Use when asked to 'run tox', 'tox'.
---

# Tox Test & Lint Auto-Fixer

Automatically run `tox` and iteratively resolve all linting, formatting, and test failures until the tox suite passes cleanly.

## Phase 1: Execute Tox
1. Identify the target repository, read workspace/local instructions, and inspect the working
   tree. Confirm tox is configured and available in its environment. Do not introduce tox into
   a project using another runner. Do not stage files as a prerequisite for running tests.
2. Run the configured tox invocation with the target repository as working directory:
   `tox`
3. Evaluate the exit status:
   - **Exit code 0:** All checks passed. Output success message and exit.
   - **Non-zero exit code:** Errors detected. Capture the stdout/stderr output and proceed to Phase 2.


## Phase 2: Validate Code Quality & Auto-Fix
1. Re-run the failing configured environment/target from Phase 1, preserving the project's
   actual environment names and argument forwarding. Apply minimal in-scope fixes, preserve
   unrelated user work, then re-run the same command. Handle authorized repositories separately.
2. **CRITICAL:** If the same error persists unchanged across 3 consecutive iterations, **STOP HERE**. Do not stage, commit, or push. Report the remaining errors to the user.


## Phase 3: Iterative Validation Loop
1. Re-run `tox`:
   `tox`
2. **Evaluate Status:**
   - **If tox passes (Exit code 0):** Confirm all environments succeeded. Exit loop.
   - **If tox fails (Exit code != 0):** 
     - Check if progress is being made (i.e., total error count is decreasing).
     - Return to Phase 2 and repeat the fix process.
     - **Safety Circuit Breaker:** If the same error persists unchanged across 3 consecutive iterations, halt the loop and request user intervention with the remaining log output.
