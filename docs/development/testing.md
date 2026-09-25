# Testing strategy

Who is this for? This page explains how changes to this repository are
validated.

## Test suite

The repository ships a minimal test suite for the installer and definition
headers (`tests/install.test.mjs:1`, `package.json: scripts.test`):

```sh
npm test          # node --test: header/format + installer per-item tests
```

`npm test` covers:
- every `src/skills/*/SKILL.md:1` has valid `name`/`description` (22), `SKILL.md` at root, quoting when `:` in description;
- every `src/agents/*.md:1` and `src/commands/*.md:1` has `description`;
- installer `scripts/install.mjs:1` per-item copy/link, coexistence (`other-pack` preserved), `PREFIX` isolation, `--dry-run`, `--uninstall`, target selection, `pi`, `compat`, and rejection of removed selector flags.

The tests use isolated temporary prefixes and clean them up automatically. Set
`KEEP_WORK=1` when inspecting the test fixtures under `~work/`. The directory
is git-ignored (`.gitignore:1`).

## Definition validation

Changes to agents, skills, and commands are validated both by tests and
manually against conventions:

| Check | Criterion |
|---|---|
| Skill entrypoint | `SKILL.md` exists at the skill directory root (`README.md:155`) |
| Frontmatter | `name:`/`description:` for skills; `description:` for agents and commands (`README.md:155-157`) |
| Output standard | Content follows the TUI-portable standard (`AGENTS.md:100-113`) |
| Permissions | Deny-first, allow-last convention and a restricted write surface |
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