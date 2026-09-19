---
description: Debug failures/bugs with root-cause fix loop
agent: build
---

Debug task: $ARGUMENTS

## Workflow

1. Identify the primary repository, consulted dependencies, and authorized write scope.
   Read workspace and nested `AGENTS.md` instructions and inspect each relevant working tree.
2. Load the `debug` skill. Resolve the repository's actual environment, runner, and test commands;
   do not assume tox, uv, direnv, Selenium, or pytest-django. Do not repeat configured flags.
3. Reproduce minimally in the correct repository working directory and isolate the root cause.
4. Implement the smallest fix. Add meaningful regression coverage when warranted, following the
   debug skill's approval rule before modifying existing tests. Do not weaken assertions merely
   to make tests pass. Generate migrations for schema changes.
5. Re-run the failing check, then the relevant project checks. For cross-repo fixes, verify each
   changed repository and the affected integration in dependency order.
6. Report root cause, changed repositories, commands, working directories, and results. Update
   workspace-required analysis and prompt records. Do not commit or push unless requested.
