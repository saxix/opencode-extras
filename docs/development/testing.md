# Testing strategy

Who is this for? This page explains how changes to this repository are
validated.

## Test suite

The repository ships a minimal test suite for the installer, definition
contracts, and the analyst bookmark skill (`tests/install.test.mjs:1`,
`package.json: scripts.test`):

```sh
npm test          # node --test: definition contracts + installer per-item tests
```

`npm test` covers:
- all 24 skills have valid `name`/`description`, a root `SKILL.md`, and quoted
  descriptions when they contain `:`;
- all 10 agents and every command that declares frontmatter have valid
  frontmatter; all 8 command files are non-empty;
- the retired `issue-save`, `issue-load`, and `issue-list` commands are gone and the
  `issue-bookmarks` skill enforces the two analyst roles, validated names, the
  shared compact persistence contract, and one validity rule set;
- each analyst loads both that skill and the shared state layout spec, and
  names only its own bookmark directory;
- both analysts are granted read, glob, and edit on `.ai-temp/findings/**` and
  nothing broader under `.ai-temp/`;
- the installer removes retired command files on install and uninstall, and
  never installs editor backups or dotfiles from `src/`;
- installer `scripts/install.mjs:1` behavior: per-item copy/link, coexistence
  (`other-pack` preserved), `PREFIX` isolation, `--dry-run`, `--uninstall`,
  global/project scope, and rejection of removed selector flags.

The tests use isolated temporary prefixes and clean them up automatically. Set
`KEEP_WORK=1` when inspecting the test fixtures under `~work/`. The directory
is git-ignored (`.gitignore:1`).

## Definition validation

Changes to agents, skills, and commands are validated both by tests and
manually against conventions:

| Check | Criterion |
|---|---|
| Skill entrypoint | `SKILL.md` exists at the skill directory root (`AGENTS.md:97`) |
| Frontmatter | `name:`/`description:` for skills; `description:` for agents and commands (`AGENTS.md:97-99`) |
| Output standard | Content follows the TUI-portable standard (`AGENTS.md:118-131`) |
| Permissions | Deny-first, allow-last convention and a restricted write surface |
| Bookmark safety | Active role, paths, names, overwrite, and explicit-only save |
| Docs consistency | Documentation changes match the docs taxonomy (`skills/documentation/SKILL.md`) |

For TUI behavior, open a session in this repository and trigger the changed
agent, skill, or command; then restart to confirm it reloads.

## When more tests appear

If a future change introduces real code (for example a plugin), extend
`tests/` with an appropriate suite; the current suite is minimal and focused
on the installer.

## Next steps

- Authoring rules in detail: [Contribution guidelines](contribution.md).
- Conventions audit: [Maintenance and operations](../admin/operations.md).