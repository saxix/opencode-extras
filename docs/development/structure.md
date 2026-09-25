# Codebase structure

Who is this for? This page maps the repository layout for contributors.

## Top-level layout

| Path | Description |
|---|---|
| `src/agents/` | Agent definitions: Markdown with YAML frontmatter, `description:` required (10) |
| `src/skills/` | Skills: one subdirectory per skill with a `SKILL.md` entrypoint and optional reference docs (22) |
| `src/commands/` | Slash-command definitions: Markdown prompt bodies with optional frontmatter (`description:`, `agent:`) (12) |
| `src/plugins/` | Reserved for TUI plugins; empty |
| `scripts/install.mjs` | Node installer for `npx opencode-utils` (per-item copy/link, `PREFIX` support) |
| `tests/install.test.mjs` | Minimal test suite (`node --test`, definition contracts + installer) |
| `package.json` | NPM package `@saxix/opencode-utils` with `bin` and `test` script |
| `AGENTS.md` | Project instructions loaded by coding agents |
| `README.md` | Project readme |
| `.envrc` | Local credentials, git-ignored |
| `.ai-temp/` | Analyst bookmarks and glossary cache, git-ignored (may not exist in a fresh clone) |
| `~work/` | Temporary test fixtures, git-ignored |

Evidence: directory listing, `README.md:5-26`, `package.json:6-8,30-32`.

## `src/agents/`

One file per agent under `src/agents/`. Frontmatter carries `description` (required), `mode`
(`primary` or `subagent`), `color`, `steps`, and `permissions`. The file body
starts with a role statement and typically contains: role and capability
questions, an operating contract or state machine, a working method, guardrails,
and a handoff/report format. `src/agents/_shared/state-persistence.md` is not an
agent: the installer places it under `sax/shared/` so it defines the shared
bookmark contract without being discovered as another agent.

## `src/skills/`

One directory per skill under `src/skills/`. Each directory must contain `SKILL.md`; reference
material lives alongside in named subdirectories such as `refs/`,
`references/`, `languages/`, `infrastructure/` (`README.md:94`). The
`documentation` skill defines the docs site taxonomy; the security skills
group orchestration, threat modeling, and OWASP reviews.

## `src/commands/`

One Markdown file per command under `src/commands/`. The body below the frontmatter is the prompt
the TUI runs; `$ARGUMENTS` is replaced with the user's input
(`src/commands/devils-advocate.md:10`). Some commands declare `agent:` to run on a
specific agent (`src/commands/new-spec.md:3`). `issue-save`, `issue-load`, and
`issue-list` deliberately omit `agent:` so they can verify the active analyst
and operate in the current session.

## Conventions that shape the layout

- Every skill MUST have a `SKILL.md` at its directory root (`README.md:180`).
- `.gitignore` excludes all dotfiles and editor backups (`~*`); only
  `.gitignore` itself is kept among dotfiles (`AGENTS.md:103`).
- `plugins/` is reserved but currently empty.
- Analyst state is explicit and compact: only `issue-save` writes
  `.ai-temp/<analyst>/<name>.md`; neither analyst may inspect the other analyst's
  directory.

## Next steps

- Writing style rules: [Contribution guidelines](contribution.md).
- Install mapping: [Architecture and topology](../deploy/architecture.md).