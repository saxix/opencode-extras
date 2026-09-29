# Local environment setup

Who is this for? This page is for contributors who want to work on the
definitions in this repository.

## Prerequisites

- `git` to clone the repository.
- `Node.js 18+` and `npx` for the installer and tests (`package.json:10`, `tests/install.test.mjs:1`).
- Unix shell (macOS or Linux) for the commands below.
- No Python, `uv`, tox, or other build toolchain except for optional ticketing
  MCP servers or `properdocs` site build.
- Optional: an installed TUI (opencode, Claude Code, Codex, pi) to exercise the
  definitions; `uv` only if you also run the ticketing MCP servers; `properdocs`
  only if you want to render the documentation site.

## Clone and verify

```sh
git clone https://github.com/saxix/opencode-utils.git agents-skills
cd agents-skills
npm test
```

### Install this clone into a project with --link (dev live)

```sh
# install this clone into itself
node ./scripts/install.mjs --project --link --agent opencode
ls -l .opencode/skills/sax-security

# install this clone into another project
cd /path/to/your/project
node /path/to/opencode-utils/scripts/install.mjs --project --link --agent opencode
ls -l .opencode/skills/sax-security

# compat layout
node /path/to/opencode-utils/scripts/install.mjs --agent compat --link
ls -l .agents/skills/sax-security
readlink .agents/skills/sax-security

# keep work dir for inspection (tests use ./~work)
KEEP_WORK=1 node --test tests/install.test.mjs
ls -R ./~work
```

`npm test` runs `tests/install.test.mjs:1` (validation for skill, agent, and
command contracts, including the guarded analyst bookmark skill, plus
isolated `PREFIX` installs).

## Tooling expectations

- A Markdown editor that handles YAML frontmatter and CommonMark.
- `git` for version control; the repository history is small and linear
  (see [Git workflow](git-workflow.md)).
- No linters or formatters are configured for this repository.

## Local-only files

- `.envrc` -- local environment variables for ticketing credentials
  (see [Security](../admin/security.md)). It is git-ignored.
- `.ai-temp/` -- explicit analyst bookmarks and the project glossary cache
  (git-ignored; never committed).
- `.idea/` -- editor preferences (git-ignored via the `.*` rule,
  `.gitignore:2`).

## Try the definitions without install

You can exercise agents and commands directly in an opencode session opened in
this repository: opencode reads project-scope `opencode.jsonc` and the
installed global definitions. For a full sandbox, run `npx opencode-utils` (see
[Installation](../deploy/installation.md)).

## Next steps

- Understand where everything lives: [Codebase structure](structure.md).
- Learn the writing rules: [Contribution guidelines](contribution.md).
- Verify the documentation site: [Testing and verification](testing.md).