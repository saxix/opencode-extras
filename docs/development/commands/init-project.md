# init-project

Creates or updates `AGENTS.md` and `.ai/*` files (`commands/init-project.md:2`).

## Details

| Field | Value |
|---|---|
| Frontmatter | `description:` Create or update `AGENTS.md` and `.ai/*` files |
| Agent | `build` (`commands/init-project.md:3`) |
| Input | Optional project context through `$ARGUMENTS` |

## Behavior

Bootstraps a project's instruction files: the project-level `AGENTS.md` that
coding agents load first, and optional `.ai/*` instruction files. These need explicit
entries in the user's `instructions` configuration to load as extra context. Run it when starting a
new worktree or reshaping project instructions.

## Related

- [AGENTS.md glossary entry](../../glossary.md#agentsmd)