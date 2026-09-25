# Documenter Profiles Index

This directory owns the per-type documentation profiles for the `documenter` agent.
The `documenter` agent and the `documentation` skill must reference these files instead of duplicating preset definitions.

## Preset → Guides

| Preset | Included Guides | Excluded by Default | Profile File |
|---|---|---|---|
| **Library / SDK** | User Guide, Development Guide (+ API reference if it exposes one) | Administrative, Deploy (unless runtime config / deploy story) | `library.md` |
| **CLI tool** | User Guide (Installation + Arguments/Commands + Usage Examples), Development Guide | Administrative, Deploy (unless service component) | `cli.md` |
| **Skill / Skill pack** | User Guide (Installation + SKILL.md structure + Agents/Commands), Development Guide | Administrative, Deploy | `skill.md` |
| **MCP Server** | User Guide (Installation + Tools/Resources/Prompts + Transport + Usage Examples), Development Guide | Administrative, Deploy (unless service component) | `mcp-server.md` |
| **Application / Service (Project)** | User Guide, Administrative Guide, Development Guide, Deploy Guide | — (all four) | `project.md` |
| **Custom** | Any combination confirmed by the user | As confirmed | — (user list) |

## Mandatory Sections per Type

- **Library:** Installation (pip/pipx/uv), API/Usage, Development — see `library.md`.
- **CLI:** Installation, Arguments/Commands, Usage Examples, Development — see `cli.md`.
- **Skill:** Installation (npx), SKILL.md frontmatter, Agents/Skills/Commands structure, Development — see `skill.md`.
- **MCP Server:** Installation, Arguments/Commands, Tools/Resources/Prompts, Transport (stdio/SSE), Usage Examples, Development — see `mcp-server.md`.
- **Project:** All four guides plus shared sections (index, glossary, API reference) — see `project.md`.

## Common Rules

All profiles inherit `common.md` (language, evidence, style, verification base). The `documenter` agent must load `common.md` first, then the selected profile.

## How to Add a New Profile

1. Create `src/skills/documentation/specs/<type>.md` with sections: Purpose, Required Guides, Mandatory Sections, Evidence Sources, Verification Checklist, Example Structure.
2. Add a row to the table above.
3. Update `src/agents/documenter.md` scoping question checklist to include the new type.
4. Update `src/skills/documentation/SKILL.md` scope tailoring if the taxonomy changes.
