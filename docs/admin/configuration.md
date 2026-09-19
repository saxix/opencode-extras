# Configuration reference

## Configuration ownership

The Windows installer supports both user-global and project/workspace-local installations.
The Unix Make targets link definitions into the user configuration directory. Neither installs or
overwrites provider, model, TUI, or MCP configuration.

The checkout's `opencode.jsonc` is local to toolkit development. Its `references` entries point
to optional sibling repositories; these are supporting source references, not MCP server
registrations. They are not prerequisites for using the agents and skills elsewhere.

## Shared workspace instructions

Add `.opencode/instructions/workspace.md` to the workspace configuration's `instructions`
array, preserving existing entries. For a fixed Windows workspace an absolute path with
forward slashes is appropriate. The workspace `AGENTS.md` supplies local reporting conventions;
agents explicitly read nested repository instructions before operating on those repositories.

Report directories, language, and prompt logging are optional deployment policies. The generic
analysts write internal scratch only and present deliverables in the conversation. Snapshots use
`.ai-temp/<repo_key>/<activity_id>/<agent>.yaml`, with one glossary per repository at
`.ai-temp/<repo_key>/glossary-known-terms.yaml`. See `src/instructions/workspace.md`.

## Agent frontmatter

Agent definitions live in `src/agents/*.md`. Required: `description`. Optional OpenCode fields
include `mode`, `hidden`, `color`, `steps`, `model`, and `permission`.

```yaml
permission:
  edit:
    "*": deny
    "**/.ai-temp/**": allow
  bash: deny
  task:
    "*": deny
    code-impact-explorer: allow
```

Use `permission` singular, not a `permissions` list. Tool keys are `bash` and `task`, not
`shell` and `subagent`. OpenCode evaluates the last matching pattern: broad rules go first.
Recursive path patterns allow the definitions to work from a parent multi-repository workspace.
They do not dynamically limit access to the activity's selected repositories; the operating
contract supplies that scope. Narrow permissions further in a deployment if hard per-repo
isolation is required. Grep/glob rules are separate from read rules; read restrictions alone
do not establish a content-search boundary.

Business and System Analysts can save internal state by default. Persistent reports need local
instructions and matching agent permissions; see [Local policy](local-policy.md). Analysts
cannot edit application code. Read-only subagents cannot edit or run shell commands.
Documentation agents write only the configured documentation surfaces; shell checks require
the host's permission flow because projects use different build commands.

Validate against the installed OpenCode loader and its schema. Other clients may not enforce
OpenCode permission fields. Portable Markdown formatting does not imply identical tool controls.

## Skills and commands

- Skills: `src/skills/<name>/SKILL.md`, with required `name` and `description`.
- Commands: `src/commands/*.md`, with `description` and optional `agent`.
- Skill examples do not override actual repository versions, runners, or database conventions.
- Ticketing integrations are optional and must be explicitly configured in the user's config.
  Without one, use supplied ticket text and the agents' provider-neutral draft workflow.

## Reloading

Quit and restart OpenCode after changing config, linked agent definitions, or skills. Verify
resolved agents and skills using the checks in `docs/development/testing.md`.
