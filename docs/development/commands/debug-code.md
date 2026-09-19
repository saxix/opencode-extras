# debug-code

Runs a root-cause fix loop for failures and bugs (`commands/debug-code.md:2`).

## Details

| Field | Value |
|---|---|
| Frontmatter | `description:` Debug failures/bugs with root-cause fix loop |
| Agent | `build` (`commands/debug-code.md:3`) |
| Input | Task or failure description through `$ARGUMENTS` |

## Behavior

Invokes the debug workflow: investigate the failure, find the root cause, and
apply minimal fixes until the issue is resolved. Reads workspace and repository instructions,
loads the debug skill, resolves each project's actual environment and runner, and verifies
authorized cross-repo fixes separately. No tox, uv, or direnv setup is assumed.

## Related

- [debug skill](../skills-reference.md#debug)
- [tox-fix skill](../skills-reference.md#tox-fix)