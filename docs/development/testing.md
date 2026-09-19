# Verification

There is no application test suite. Verify instruction definitions with the OpenCode loader
and review, and verify installers with their focused smoke tests.

## Windows installer smoke test

```powershell
.\scripts\test-workspace-install.ps1
```

The script uses a unique temporary sandbox and removes it afterward without traversing junction
targets. It checks dry-run, paths containing spaces, expected junction targets, repeat installation,
conflicting real directories and links, preflight before mutation, and missing workspace rejection.
Global-mode tests also check custom config paths and preservation of an existing config file.
Use `-TempRoot <existing-directory>` to select the temporary parent.

## Unix install smoke test

```sh
make test
```

This installs twice under the ignored `~build/` prefix to check repeat installation without
touching the user's home configuration. `make clean` removes that sandbox. Run it on a Unix
environment with GNU Make and the usual symlink tools; Windows validation is separate.

## Automated OpenCode loader checks

```powershell
.\scripts\test-opencode-loader.ps1
```

Requires OpenCode and Git on PATH. Uses a unique temporary sandbox and isolated XDG config,
data, cache, and state directories; disables external plugins/skills for reproducibility.
Child processes run in separate standalone, multi-repository, and global-consumer roots,
with temporary Git repositories and no commits.
Checks agent/command/skill discovery, scratch-only analyst defaults, and a local report
permission merged with Markdown definitions. No model request or real ticket operation runs.
The script restores process environment variables and removes its links/sandbox afterward.

## Manual OpenCode loader checks

From the installed workspace root:

```powershell
opencode --version
opencode debug config
opencode debug skill
opencode debug agent system-analyst
opencode debug agent coder
```

Inspect resolved configuration locally: it can contain sensitive provider/MCP settings, so do
not paste raw output into reports. Verify the existing model/provider are preserved, all nine
agents and nine commands load, toolkit skills are discovered, and the shared instruction path
is present. Agent permissions should be resolved rules, not a legacy `permissions` option.
Verify broad edit denial precedes scratch exceptions for analysts, and any report exceptions
explicitly added by the local deployment. See `docs/admin/local-policy.md` for merge ordering.

Review the definitions for per-repository scope, Windows-compatible command examples,
version-aware Django guidance, separate activity state, and selective Git staging. Run
`git diff --check` before completion. Check documentation links after changing page structure.

## Functional pilot

After restarting the TUI, try a bounded analysis involving an application and a shared library.
Check that it reads nested instructions, distinguishes consulted and writable repositories,
and reports evidence per repository. An actual implementation pilot needs a concrete authorized
change and each project's environment. Loader success alone does not validate model behavior,
database migrations, external integrations, or another TUI's permission enforcement.