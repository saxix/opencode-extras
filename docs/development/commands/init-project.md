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
coding agents load first, and the `.ai/*` instruction files that opencode
loads as extra context (`opencode_cfg.jsonc:35-37`). Run it when starting a
new worktree or reshaping project instructions.

## Related

- [AGENTS.md glossary entry](../../glossary.md#agentsmd)