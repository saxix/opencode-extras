# Fixtures

Files under `tests/fixtures/` are sample repositories and sample inputs used by
the static fixture tests (`tests/fixtures.test.mjs`) and by the live evaluation
harness (`tests/eval/run-eval.mjs`). They are not source files of this
repository: they are never installed, and the repository test suite never runs
them. The only execution they see is inside the harness, in the throwaway
directory it materializes for each case.

| Path | Contents |
|---|---|
| `reviewer/` | Reviewer evaluation cases: one directory per test project |
| `reviewer/expectations.md` | The anchored expectation per case and the last run |
