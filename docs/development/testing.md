# Testing strategy

Who is this for? This page explains how changes to this repository are
validated, and why there is no code test suite.

## No code tests by design

The repository contains no application code, tests, lint, typecheck, or CI
(`README.md:95`, `AGENTS.md:102`). There is nothing to unit-test: the artifacts
are instruction definitions for coding agents.

## `make test`

The only automated check is a sandbox smoke test that verifies the install
targets:

```sh
make test
```

`test` runs `install-opencode` with `PREFIX` pointing at a local `~build/`
directory and lists the resulting layout (`Makefile:24-27`). It confirms that
the symlink commands produce the expected `~build/.config/opencode` tree
without touching the real home directory. The `~build/` sandbox is
git-ignored (`.gitignore:1`).

## Definition validation

Changes to agents, skills, and commands are validated manually against the
repository conventions:

| Check | Criterion |
|---|---|
| Skill entrypoint | `SKILL.md` exists at the skill directory root (`README.md:75`) |
| Frontmatter | `name:`/`description:` for skills; `description:` for agents and commands (`README.md:75-77`) |
| Output standard | Content follows the TUI-portable standard (`AGENTS.md:85-98`) |
| Permissions | Deny-first, allow-last convention and a restricted write surface |
| Docs consistency | Documentation changes match the docs taxonomy (`skills/documentation/SKILL.md`) |

For TUI behavior, open a session in this repository and trigger the changed
agent, skill, or command; then restart to confirm it reloads.

## When tests appear

If a future change introduces real code (for example a plugin), it must come
with an appropriate test suite and CI; the current "no code" status is a
deliberate constraint, not an oversight.

## Next steps

- Authoring rules in detail: [Contribution guidelines](contribution.md).
- Conventions audit: [Maintenance and operations](../admin/operations.md).