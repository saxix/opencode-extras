# Codebase structure

Who is this for? This page maps the repository layout for contributors.

## Top-level layout

| Path | Description |
|---|---|
| `src/agents/` | Agent definitions with required `description` frontmatter |
| `src/skills/` | Skill directories with `SKILL.md` entrypoints and references |
| `src/commands/` | Reusable command prompts |
| `src/instructions/` | Shared workspace operating rules |
| `scripts/` | PowerShell installer and smoke test |
| `opencode.jsonc` | Toolkit checkout configuration; not installed into user workspaces |
| `Makefile` | Install targets (`install-opencode`, `install-claude`), `clean`, `test` |
| `AGENTS.md` | Project instructions loaded by coding agents |
| `README.md` | Project readme |
| `.ai-temp/` | Optional scratch; workspace installs keep it at the workspace root |
| `~build/` | Sandbox produced by `make test`, git-ignored |

Evidence: directory listing, `README.md:12-20`, `Makefile`.

## `src/agents/`

One file per agent. Frontmatter carries `description` (required), `mode`
(`primary` or `subagent`), `color`, `steps`, and `permission`. The file body
starts with a role statement and typically contains: role and capability
questions, an operating contract or state machine, a working method, guardrails,
and a handoff/report format.

## `src/skills/`

One directory per skill. Each directory must contain `SKILL.md`; reference
material lives alongside in named subdirectories such as `refs/`,
`references/`, `languages/`, `infrastructure/` (`README.md:17`). The
`documentation` skill defines the docs site taxonomy; the security skills
group orchestration, threat modeling, and OWASP reviews.

## `src/commands/`

One Markdown file per command. The body below the frontmatter is the prompt
the TUI runs; `$ARGUMENTS` is replaced with the user's input
(`commands/devils-advocate.md:10`). Some commands declare `agent:` to run on a
specific agent (`commands/new-spec.md:3`).

## Conventions that shape the layout

- Every skill MUST have a `SKILL.md` at its directory root (`README.md:75`).
- `.gitignore` excludes all dotfiles and editor backups (`~*`); only
  `.gitignore` itself is kept among dotfiles (`AGENTS.md:80`).
- Workspace links are generated installation artifacts, not separate copies of definitions.

## Next steps

- Writing style rules: [Contribution guidelines](contribution.md).
- Install mapping: [Architecture and topology](../deploy/architecture.md).