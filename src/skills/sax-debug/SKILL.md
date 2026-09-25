---
name: sax-debug
description: Investigates test failures, regressions, and diffs to identify root causes and implement minimal, robust fixes without modifying tests unless explicitly approved. Use for "debug code", "fix code".
---

# Debugging & Regression Resolution

Investigate branch changes, diagnose failing tests or regressions, and implement verified fixes in the implementation code.

## Strict Test Immutability Rule

> **Never modify existing test files, test cases, or assertions without explicit user approval.**
> Treat tests as the ground truth. All fixes must be implemented within the production/source code unless the user directly confirms a test itself is invalid or outdated.

## Local Testing Instructions (read first)

Before running any test command, discover how **this** project expects tests to be run:

1. Look for testing instructions in, in order of precedence:
   - `.ai/testing.md`
   - `AGENTS.md` / `CLAUDE.md` / `README.md` (sections about "Commands", "Tests", or "Testing")
   - CI config (`.github/workflows/`, `tox.ini`, `Makefile`, `package.json` scripts) as a fallback reference.
2. If local instructions exist, they **override** the defaults below. Follow them exactly -- including:
   - the correct suite command/env name (e.g. `tox -e test` vs `-e tests`, `pytest`, `npm test`),
   - required environment variables or services (databases, caches, brokers),
   - flags that are already baked into config files (do NOT repeat them on the CLI),
   - how to run a single test.
3. If no local instructions exist, fall back to the defaults in "Test Execution Commands".

## Test Execution Commands

Defaults -- use only when no project-specific instructions were found:

- Run the test suite using:

```bash
tox -e tests
```

- To run a specific test file or target within tox (if supported):

```bash
tox -e tests -- <path_to_test_file>::<test_name>
```

## Workflow

0. Discover Test Commands
- Read local testing instructions (`.ai/testing.md`, then `AGENTS.md`/`CLAUDE.md`, then CI config).
- Resolve the suite command, single-test command, required env vars/services, and any "don't repeat these flags" notes. Use them everywhere `tox -e tests` appears below.

1. Initial Full Run & Triage
- Execute the full test suite using the resolved suite command.
- If all tests pass, stop and report a clean build.
- If failures occur, record the complete list of failing test identifiers (file + test case).

2. Iterative Single-Test Debug Loop
- Pick one failing test from the list.
- Isolate execution: run only that specific test using the resolved single-test command.
- Trace the failure to its root cause in the application source code.
- Implement the minimal source fix needed to resolve the invariant.
- Re-run the isolated test command until it passes cleanly.
- Repeat this cycle for each remaining failing test until all known failures are individually resolved.

3. Full Suite Final Verification
- Once all isolated failures pass, run the full test suite again using the resolved suite command.
- If any new or remaining failures appear: Restart the process from Step 2 (isolate and fix new failures one by one).
- If the full suite passes cleanly: Confirm resolution and conclude the debugging session.
