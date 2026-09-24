# Local environment setup

Who is this for? This page is for contributors who want to work on the
definitions in this repository.

## Prerequisites

- `git` to clone the repository.
- `Node.js 18+` and `npx` for the installer and tests (`package.json:10`, `tests/install.test.mjs:1`); `make` as optional wrapper.
- Unix shell (macOS or Linux) for `make` targets.
- No Python, `uv`, tox, or other build toolchain except for optional ticketing
  MCP servers or `properdocs` site build.
- Optional: an installed TUI (opencode, Claude Code, Codex) to exercise the
  definitions; `uv` only if you also run the ticketing MCP servers; `properdocs`
  only if you want to render the documentation site.

## Clone and verify

```sh
git clone <repository-url> agents-skills
cd agents-skills
npm test          # header/format + installer per-item copy/link tests (Node built-in)
make test         # sandbox dry-run + copy in ~build/.config/opencode
```

`npm test` runs `tests/install.test.mjs:1` (header validation for `src/skills/*/SKILL.md:1`, `src/agents/*.md:1`, `src/commands/*.md:1` and isolated `PREFIX` installs).
`make test` builds a sandbox under `~build/` with the same per-item copy layout that `npx opencode-utils --global --all` creates (`Makefile:47`). The sandbox is git-ignored (`.gitignore:1`).

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
installed global definitions. For a full sandbox, run `npx opencode-utils --global --all` or `make install` (see [Installation](../deploy/installation.md)).

## Next steps

- Understand where everything lives: [Codebase structure](structure.md).
- Learn the writing rules: [Contribution guidelines](contribution.md).
- Verify the documentation site: [Testing and verification](testing.md).