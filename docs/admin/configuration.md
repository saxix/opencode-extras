# Configuration reference

Who is this for? This page is the source of truth for every configuration file
and frontmatter field in the toolkit. Operators and contributors should keep
it in sync when config changes.

## Repository configuration files

### `opencode.jsonc` (project scope sample)

A minimal project-scope sample that allows editing files under
`~/.config/opencode/`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": {
      "~/.config/opencode/**": "allow"
    }
  }
}
```

Evidence: `opencode.jsonc:1-8`. It is a sample intended for users of this
glossary repository, not installed by the target installer.

### `opencode_cfg.jsonc` (global opencode config)

Installed as `~/.config/opencode/opencode.jsonc` by
`npx opencode-extras --global`. Declared settings
(`opencode_cfg.jsonc`):

| Setting | Value | Effect |
|---|---|---|
| `small_model` | `ollama/qwen2.5-coder:3b` | Lightweight model for background tasks |
| `default_agent` | `plan` | Agent used when none is selected |
| `subagent_depth` | `2` | Maximum subagent nesting |
| `share` | `manual` | Session sharing mode |
| `shell` | `bash` | Default shell for the TUI |
| `plugin` | `opencode-gemini-auth@latest` | Auth plugin registered at startup |
| `watcher.ignore` | `node_modules/**`, `dist/**`, `.git/**`, `.idea/**`, `.tox/**`, `.venv/**` | Paths excluded from file watching |
| `instructions` | `.ai/*.md` | Extra instruction files loaded as context |
| `attachment.image` | `auto_resize: true`, `max_width: 1000`, `max_height: 1000`, `max_base64_bytes: 5242880` | Image attachment limits |
| `formatter` | `ruff` on `*.py` | Formatting command for Python files |

### `opencode_cfg.jsonc` -- MCP servers

| Server | Provider | Enabled | Command | cwd |
|---|---|---|---|---|
| `azure-devops` | Azure DevOps | false | `uv run mcp-ticketing azure` | `{env:MCP_TICKETING_HOME}` |
| `github` | GitHub | true | `uv run mcp-ticketing github` | `{env:MCP_TICKETING_HOME}` |

Evidence: `opencode_cfg.jsonc:21-34`. The commented-out `permission` block is
a maintained example, not active configuration (`opencode_cfg.jsonc:48-71`).
Providers section declares `dwarfstar`, `ollama`, and `google` models
(`opencode_cfg.jsonc:72-249`).

#### MCP environment overrides

The `environment` field in MCP configuration allows overriding environment
variables loaded by the MCP server. This is useful when the server's `cwd`
points to a directory with its own `.envrc` but you need to use variables from
the current project instead.

```jsonc
"github": {
  "type": "local",
  "command": ["uv", "run", "mcp-ticketing", "github"],
  "cwd": "{env:MCP_TICKETING_HOME}",
  "enabled": true,
  "environment": {
    "MCP_GITHUB_OWNER": "{env:MCP_GITHUB_OWNER}",
    "MCP_GITHUB_REPO": "{env:MCP_GITHUB_REPO}",
    "MCP_GITHUB_TOKEN": "{env:MCP_GITHUB_TOKEN}"
  }
}
```

The `{env:VAR}` syntax reads values from the shell environment at runtime.
Each project must define `MCP_GITHUB_OWNER`, `MCP_GITHUB_REPO`, and
`MCP_GITHUB_TOKEN` in its own `.envrc` file. The `environment` field values
override those loaded by `uv run` from the server's `.envrc`.

### `tui_cfg.jsonc` (TUI interface config)

Installed as `~/.config/opencode/tui.jsonc` by
`npx opencode-extras --global`. Declared settings
(`tui_cfg.jsonc:1-22`):

| Setting | Value | Effect |
|---|---|---|
| `scroll_speed` | `3` | Scroll speed |
| `keybinds.command_list` | `ctrl+p` | Command list keybind |
| `scroll_acceleration.enabled` | `true` | Accelerated scrolling |
| `diff_style` | `auto` | Diff rendering style |
| `cursor` | `style: block`, `blinking: true` | Cursor appearance |
| `mouse` | `true` | Mouse support |
| `attention` | `enabled`, `notifications`, `sound`, `volume: 0.4` | Attention alerts |

## Frontmatter reference

### Skills (`SKILL.md`)

| Field | Required | Purpose |
|---|---|---|
| `name` | yes | Lowercase hyphen-separated skill name |
| `description` | yes | What it does and when to trigger; carries trigger keywords |
| `license` | no | License reference (for example `security-owasp` uses `license: LICENSE`) |
| `compatibility` | no | TUI or version compatibility notes |
| `metadata` | no | String-string map of extra metadata |

Evidence: `AGENTS.md:97-99`, `skills/security-owasp/SKILL.md:2-4`.

### Agents and commands

| Field | Required | Purpose |
|---|---|---|
| `description` | yes | Purpose and trigger keywords |
| `agent` | no (commands) | Agent the command runs on (`commands/debug-code.md:3`) |
| `mode` | no (agents) | `primary` or `subagent` (`agents/business-analyst.md:3`) |
| `color` | no | TUI display color |
| `steps` | no | Suggested step budget |
| `permissions` | no | Per-action allow/deny list, see below |

Evidence: `AGENTS.md:97-99`, the frontmatter blocks in `agents/*.md` and
`commands/*.md`.

## Permissions format

Agents declare `permissions` as a list of entries with `action`, `resource`,
and `effect`:

```yaml
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: edit
    resource: "docs/**"
    effect: allow
```

The repository convention is deny-by-default: a broad `*` deny rule comes
first, then narrow allow rules. Read and glob are broadly allowed only where an
agent needs repository access. Editing is restricted to explicit paths: the
Business Analyst may write its own bookmark directory and glossary cache, the
System Analyst may write only its own bookmark directory, both may write the
shared `.ai-temp/findings/` directory, and shell access is denied for both
analysts (`agents/business-analyst.md:7-48`, `agents/system-analyst.md:7-27`).
opencode applies this list as the agent's tool permissions.

## Keeping this page in sync

Any change to configuration files, frontmatter fields, or the permissions
convention belongs in the same changeset as this page
(`skills/documentation/SKILL.md`). The
[documentation skill](../development/skills-reference.md#documentation) audit
flags undocumented settings and outdated defaults.

## Next steps

- Runtime variables are covered in the
  [Environment variables page](../deploy/environment.md).
- Authoring new files: [Contribution guidelines](../development/contribution.md).
