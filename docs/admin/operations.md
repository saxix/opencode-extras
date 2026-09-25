# Maintenance and operations

Who is this for? This page covers day-to-day upkeep of the toolkit: updating
definitions, managing scratch state, and keeping documentation in sync.

## Updating agents, skills, and commands

Definitions are plain Markdown files under `agents/`, `skills/`, and
`commands/`. Copy installations update when the installer is rerun; linked
installations update from the checkout. After editing:

1. Restart the TUI so it reloads configuration and agent lists.
2. Verify frontmatter: `description:` is required; a skill directory must keep
   a file named exactly `SKILL.md` (`README.md:155-157`).
3. Verify the change still emits TUI-portable output
   (`AGENTS.md:100-113`).

## Install management

The installer is idempotent. Re-run the command for each target when a copy is
stale or a linked destination is broken:

```sh
npx opencode-utils --agent opencode --global
npx opencode-utils --agent claude --global
```

Use `--copy` (the default) for coexistence-safe copies or `--link` for live
local development. Test fixtures are created under `~work/` and removed after
the test run unless `KEEP_WORK=1` is set. The `~work` directory and editor
backups (for example `spec.md~`) are git-ignored (`.gitignore:1-2`).

## Scratch state

- `.ai-temp/` is agent working scratch (for example Business Analyst state
  snapshots): git-ignored, never committed, and never treated as a deliverable
  (`AGENTS.md:95`).
- The Business Analyst also maintains
  `.ai-temp/glossary-known-terms.yaml` as an accumulating project glossary of
  terms resolved from `docs/` (`AGENTS.md:95`).
- `.ai/*` instruction files are loaded as context by opencode
  (`opencode_cfg.jsonc:35-37`) and are created or updated by the
  [init-project command](../development/commands/init-project.md).

## Keeping documentation in sync

Documentation changes belong in the same changeset as the definitions they
describe. The [documentation skill](../development/skills-reference.md#documentation)
owns the site taxonomy and audit checks; the
[documenter agent](../development/agents-reference.md#documenter) generates
and updates the site under an approval gate (`agents/documenter.md:72-86`).

This documentation site is authored as plain static Markdown and ships no
build configuration. If a rendering tool is configured later (for example
`properdocs`), its build result is verified when one runs; today the
verification standard is the static checklist in the documentation skill
(structure, links, consistency).

## Housekeeping checklist

- [ ] No tracked dotfiles besides `.gitignore` (`AGENTS.md:94`).
- [ ] No secrets committed; `.envrc` stays untracked (see
  [Security](security.md)).
- [ ] Skills have a `SKILL.md` entrypoint and frontmatter is valid.
- [ ] Docs pages match the taxonomy and link correctly.

## Next steps

- Security policy: [Security and compliance](security.md).
- Troubleshooting: [Troubleshooting](troubleshooting.md).