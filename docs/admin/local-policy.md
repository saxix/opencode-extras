# Local deployment policy

The toolkit supplies reusable roles and skills. Keep organization-specific paths, report
language, retention/naming conventions, and prompt logging in the consuming project's or
workspace's `AGENTS.md`. The toolkit does not require a parent workspace or central reports.

## Default behavior

- Install globally and launch from any individual repository, or install locally in a project
  or multi-repository workspace. Installation scope does not force an operating mode.
- Shared `instructions/workspace.md` is optional and supports both operating modes.
- Analysts return deliverables in conversation and may persist internal `.ai-temp/` snapshots.
- No report directory or prompt log is created by default. Use the user's language unless
  local instructions say otherwise. Ticket-facing language follows the ticket-writing skill.
- Project tools, runtime versions, database, and conventions are discovered locally.

## Adding a report policy

1. Define the report directory, language, file naming, append rules, and whether prompt logging
   is required in the local `AGENTS.md`. Distinguish working reports from temporary state.
2. Add a narrow permission exception for each agent that needs to persist reports. Instructions
   alone cannot grant tool permissions. Do not modify linked toolkit files for a local policy.
3. Verify the effective rules with the installed OpenCode loader after merging settings.

For example, merge this fragment into an existing project/workspace configuration, replacing
the example absolute path with the intended report directory. Preserve unrelated fields:

```json
{
  "agent": {
    "system-analyst": {
      "permission": {
        "edit": {
          "*": "deny",
          "C:/work/projects/reports/**": "allow"
        }
      }
    },
    "business-analyst": {
      "permission": {
        "read": {
          "*": "ask",
          "C:/work/projects/reports/**": "allow"
        },
        "edit": {
          "*": "deny",
          "C:/work/projects/reports/**": "allow"
        }
      }
    }
  }
}
```

The same edit-map pattern can extend `documenter` to a local report location. On Unix use
the corresponding absolute Unix path. A directory outside the active project/workspace may
also require an explicit `external_directory` policy; edit permission alone does not grant it.

## Rule order and merging

Always include the broad baseline rule first in the local map, even when it is already in
the Markdown agent. OpenCode's project config and Markdown definitions are merged; adding only
the narrow exception can place it before the Markdown `"*": "deny"` and make it ineffective.
Do not switch the baseline to `allow` to work around this. Agent source fields still govern
their role; configuration is not an unrestricted override of every Markdown field.

Inspect `opencode debug agent system-analyst`: the broad edit deny must precede the report allow,
and the scratch exception must remain. Verify that application edits still have no allow rule.
The regression check in `scripts/test-opencode-loader.ps1` exercises this merge with a neutral
`reports/` directory, in both local and globally installed definitions.

## Migration from the workspace-specific version

If a deployment previously relied on report permissions embedded in agent definitions, add
its local exceptions before restarting with the generalized definitions. Keep language and
logging in local instructions. Existing junctions and activity snapshots remain usable;
legacy fixed-name snapshots retain their explicit-selection migration behavior.

This preserves the useful correctness fixes (current OpenCode permission format, version-aware
Django guidance, selective Git staging). It does not restore outdated APIs or unsafe blanket
staging from older prompts. Quit and restart OpenCode after changing configuration.
