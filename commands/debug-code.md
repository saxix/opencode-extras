---
description: Debug failures/bugs with root-cause fix loop
agent: build
---

Debug task: $ARGUMENTS

## Environment (always required)
- direnv/.envrc 
- Never repeat flags already in pytest.ini (--create-db, coverage, junit).
- Allowed shells: tox/git/gh only; run pytest through tox.

## Workflow
1. Reproduce minimally:
   - One test:  tox -e tests -- tests/<app>/test_foo.py -k name
   - Full suite: tox -e tests
   - Selenium-only repro: add -m selenium (use --show-browser for visibility).
2. Isolate root cause before touching code: read the traceback bottom-up, then the
   involved model/view/form. Insert breakpoint() (lands in ipdb) for state inspection;
   remove all breakpoints before finishing.
3. Fix in source code only -- never edit tests or assertions without explicit approval.
   Model changes require a migration (check-missed-migrations hook will fail otherwise);
4. Verify: re-run the isolated command until green, then full tox -e test,
   then tox -e lint and tox -e mypy if source files changed.
5. Report: root cause, the fix, and verification evidence (commands + results). No commit unless asked.
