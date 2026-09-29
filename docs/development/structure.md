# Codebase structure

Who is this for? This page maps the repository layout for contributors.

## Top-level layout

| Path | Description |
|---|---|
| `src/agents/` | Agent definitions: Markdown with YAML frontmatter, `description:` required (10) |
| `src/skills/` | Skills: one subdirectory per skill with a `SKILL.md` entrypoint and optional reference docs (24) |
| `src/commands/` | Slash-command definitions: Markdown prompt bodies with optional frontmatter (`description:`, `agent:`) (8) |
| `src/_shared/` | Shared specs that are not agents, skills, or commands |
| `src/plugins/` | Reserved for TUI plugins; empty and not installed |
| `scripts/install.mjs` | Node installer for `npx opencode-utils` (per-item copy/link, `PREFIX` support) |
| `tests/install.test.mjs` | Minimal test suite (`node --test`, definition contracts + installer) |
| `package.json` | NPM package `@saxix/opencode-utils` with `bin` and `test` script |
| `AGENTS.md` | Project instructions loaded by coding agents |
| `README.md` | Project readme |
| `.envrc` | Local credentials, git-ignored |
| `.ai-temp/` | Analyst bookmarks and the shared findings directory, git-ignored (may not exist in a fresh clone) |
| `~work/` | Temporary test fixtures, git-ignored |

Evidence: directory listing, `README.md:5-26`, `package.json:6-8,30-32`.

## `src/agents/`

One file per agent under `src/agents/`. Frontmatter carries `description` (required), `mode`
(`primary` or `subagent`), `color`, `steps`, and `permissions`. The file body
starts with a role statement and typically contains: role and capability
questions, an operating contract or state machine, a working method, guardrails,
and a handoff/report format.

## `src/_shared/`

One directory per shared spec namespace. A spec here is neither an agent, a
skill, nor a command, so the TUI must not discover it. The installer mirrors the
source path verbatim: `src/_shared/sax/state-persistence.md` lands at
`DEST/_shared/sax/state-persistence.md`, and an agent references it as
`../_shared/sax/state-persistence.md`. Only `agents`, `skills`, and
`commands` have item-level rules; every other top-level directory is
copied or linked as one unit.

A shared spec exists because more than one agent depends on it:
`state-persistence.md` carries the `.ai-temp/` state layout, write policy, and
legacy state rules used by both analysts, plus the shared `findings/` directory
where they exchange observations. Rules that only one consumer applies belong in
that consumer (the Business Analyst project terms cache lives in this spec
because only it may read `docs/`, and the bookmark contract moved into a skill
once both analysts needed it).

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
specific agent, for example `agent: build` (`src/commands/debug-code.md:3`). No
command targets an analyst role: the analyst bookmark
operations are a skill (`src/skills/sax-issue-bookmarks/`) so the active analyst
verifies the active role itself and operates in the current session.

## Conventions that shape the layout

- Every skill MUST have a `SKILL.md` at its directory root (`README.md:180`).
- `.gitignore` excludes all dotfiles and editor backups (`~*`); only
  `.gitignore` itself is kept among dotfiles (`AGENTS.md:103`).
- `plugins/` is reserved but currently empty.
- Analyst state is explicit and compact: only the `issue-bookmarks` skill writes
  `.ai-temp/<analyst>/<name>.md`; neither analyst may inspect the other analyst's
  directory.

## Next steps

- Writing style rules: [Contribution guidelines](contribution.md).
- Install mapping: [Architecture and topology](../deploy/architecture.md).