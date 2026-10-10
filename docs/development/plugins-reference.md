# Plugin reference

Who is this for? This page catalogs every plugin in `src/plugins/`, with its purpose
and registered tools. Source of truth: `src/plugins/*/README.md` and the TypeScript
implementation in each plugin directory.

## Summary

| Plugin | Purpose |
|---|---|
| [sessions](#sessions) | List, prune, and archive AI sessions via the OpenCode v2 plugin API |

## sessions

Provides three tools to manage AI session lifecycle: listing active sessions with
status and age, pruning sessions older than a configurable threshold, and archiving
a session without deleting it (`src/plugins/sessions/README.md`).

| Tool | Description | Arguments |
|---|---|---|
| `list-sessions` | List all active sessions with status, age (minutes), and title | none |
| `prune-sessions` | Delete sessions older than N days | `days: number` |
| `archive-session` | Set session status to `archived` | `sessionId: string` |

The plugin exports `SessionManagerPlugin: Plugin` and registers all tools under a
single `tool` map using the `@opencode-ai/plugin` `tool()` helper
(`src/plugins/sessions/index.ts:4-95`). Age calculation rounds to whole minutes;
pruning uses a strict greater-than comparison so a session created exactly N days
ago is excluded. Prune failure handling skips individual sessions and reports their
IDs at the end of the response (`src/plugins/sessions/index.ts:57-64`).

Integration requires adding the compiled module to the OpenCode plugins array in
`opencode.json` or `opencode.jsonc`. No filesystem side-effects occur outside the
SDK session endpoints.

## Next steps

- Installing a plugin: [Getting started](../user-guide/getting-started.md).
- Repository layout: [Structure](structure.md).
