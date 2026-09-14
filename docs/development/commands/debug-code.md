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
apply minimal fixes until the issue is resolved.

## Related

- [debug skill](../skills-reference.md#debug)
- [tox-fix skill](../skills-reference.md#tox-fix)