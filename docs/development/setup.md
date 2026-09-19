# Local environment setup

Who is this for? This page is for contributors who want to work on the
definitions in this repository.

## Prerequisites

- `git` to clone the repository.
- Windows: PowerShell 5.1+; Unix: GNU Make and a shell.
- No Python, `uv`, tox, or any other build toolchain: the repository contains
  no application code and no CI (`README.md:95`).
- Optional: an installed TUI (opencode, Claude Code) to exercise the
  definitions; `uv` only if you also run the ticketing MCP servers; `properdocs`
  only if you want to render the documentation site (no build configuration is
  shipped).

## Clone and verify

```sh
git clone <repository-url> agents-skills
cd agents-skills
make test
```

`make test` builds a sandbox under `~build/` with the same symlink layout that
`install-opencode` creates, verifying the install targets (`Makefile:24-27`).
The sandbox is git-ignored (`.gitignore:1`).

On Windows, run `scripts/test-workspace-install.ps1` instead. It creates and cleans a
temporary workspace and tests the junction installer. See `docs/development/testing.md`.

## Tooling expectations

- A Markdown editor that handles YAML frontmatter and CommonMark.
- `git` for version control; the repository history is small and linear
  (see [Git workflow](git-workflow.md)).
- No linters or formatters are configured for this repository.

## Local-only files

- `.envrc` -- local environment variables for ticketing credentials
  (see [Security](../admin/security.md)). It is git-ignored.
- `.ai-temp/` -- agent scratch state (git-ignored).
- `.idea/` -- editor preferences (git-ignored via the `.*` rule,
  `.gitignore:2`).

## Try the definitions without install

You can exercise agents and commands directly in an opencode session opened in
this repository: opencode reads project-scope `opencode.jsonc` and the
installed global definitions. For a full sandbox, run `make install-opencode`
(see [Installation](../deploy/installation.md)).

## Next steps

- Understand where everything lives: [Codebase structure](structure.md).
- Learn the writing rules: [Contribution guidelines](contribution.md).
- Verify the documentation site: [Testing and verification](testing.md).