# Codebase structure

Who is this for? This page maps the repository layout for contributors.

## Top-level layout

| Path | Description |
|---|---|
| `agents/` | Agent definitions: Markdown with YAML frontmatter, `description:` required |
| `skills/` | Skills: one subdirectory per skill with a `SKILL.md` entrypoint and optional reference docs |
| `commands/` | Slash-command definitions: Markdown prompt bodies with optional frontmatter (`description:`, `agent:`) |
| `plugins/` | Reserved for TUI plugins; empty |
| `opencode.jsonc` | Project-scope sample config (edits under `~/.config/opencode`) |
| `opencode_cfg.jsonc` | Sample global opencode config |
| `tui_cfg.jsonc` | Sample opencode TUI interface config |
| `Makefile` | Install targets (`install-opencode`, `install-claude`), `clean`, `test` |
| `AGENTS.md` | Project instructions loaded by coding agents |
| `README.md` | Project readme |
| `.envrc` | Local credentials, git-ignored |
| `.ai-temp/` | Agent scratch state, git-ignored (may not exist in a fresh clone) |
| `~build/` | Sandbox produced by `make test`, git-ignored |

Evidence: directory listing, `README.md:12-20`, `Makefile`.

## `agents/`

One file per agent. Frontmatter carries `description` (required), `mode`
(`primary` or `subagent`), `color`, `steps`, and `permissions`. The file body
starts with a role statement and typically contains: role and capability
questions, an operating contract or state machine, a working method, guardrails,
and a handoff/report format.

## `skills/`

One directory per skill. Each directory must contain `SKILL.md`; reference
material lives alongside in named subdirectories such as `refs/`,
`references/`, `languages/`, `infrastructure/` (`README.md:17`). The
`documentation` skill defines the docs site taxonomy; the security skills
group orchestration, threat modeling, and OWASP reviews.

## `commands/`

One Markdown file per command. The body below the frontmatter is the prompt
the TUI runs; `$ARGUMENTS` is replaced with the user's input
(`commands/devils-advocate.md:10`). Some commands declare `agent:` to run on a
specific agent (`commands/new-spec.md:3`).

## Conventions that shape the layout

- Every skill MUST have a `SKILL.md` at its directory root (`README.md:75`).
- `.gitignore` excludes all dotfiles and editor backups (`~*`); only
  `.gitignore` itself is kept among dotfiles (`AGENTS.md:80`).
- `plugins/` is reserved but currently empty.

## Next steps

- Writing style rules: [Contribution guidelines](contribution.md).
- Install mapping: [Architecture and topology](../deploy/architecture.md).