---
name: upgrade
description: Audit and upgrade Python dependencies using the target repository's existing package manager and validation commands. Use for dependency upgrades or dependency security audits.
---

# Dependency audit and upgrade

## Establish the baseline

1. Read workspace and target repository instructions. Identify authorized repositories,
   working trees, supported Python/Django versions, package manager, lockfiles, and validation.
2. Use the existing manager (PDM, uv, Poetry, pip-tools, or another documented tool). Do not
   create a different manager's lockfile or change the toolchain to match an example.
3. Run the project's configured audit and outdated-package checks when available. Distinguish
   known vulnerabilities from newer releases. Missing audit tooling is an unverified check,
   not evidence that dependencies are secure or up to date.
4. Establish baseline test results and record pre-existing failures. Preserve all user changes.

## Upgrade loop

1. Select one dependency and a target compatible with the supported runtime and requested scope.
   A request for routine updates does not imply a Django major-version migration.
2. Use the manager's documented targeted update command and review the resolved dependency diff.
3. Run relevant tests and required project checks in that repository's environment and working
   directory. Use tox only where configured. For shared packages, verify affected consumers
   within the authorized cross-repo scope and report unverified consumers.
4. If a failure needs a small compatible fix, implement and verify it. If it requires an unresolved
   architecture or compatibility decision, stop that upgrade and report the decision.
5. Undo only changes from the failed attempt, preserving successful earlier updates and user work.
   Never use a blanket checkout/reset/clean to revert the workspace. If selective reversal is
   ambiguous, leave the diff intact and ask.
6. Do not stage, commit, or push unless requested. Keep changes and results separate per repository.

## Report

- Repository, manager, and runtime constraints.
- Each package's old and new resolved versions and relevant transitive changes.
- Audit findings, checks run, working directories, and outcomes.
- Deferred updates, required decisions, and cross-repo compatibility still to verify.
- Update workspace analysis records in the configured language and location.
