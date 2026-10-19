# Maintenance and operations

Who is this for? This page covers day-to-day upkeep of the toolkit: updating
definitions, managing scratch state, and keeping documentation in sync.

## Updating agents, skills, and commands

Definitions are plain Markdown files under `agents/`, `skills/`, and
`commands/`. Copy installations update when the installer is rerun; linked
installations update from the checkout. After editing:

1. Restart opencode so it reloads configuration and agent lists.
2. Verify frontmatter: `description:` is required; a skill directory must keep
   a file named exactly `SKILL.md` (`AGENTS.md:97-99`).
3. Run `npm test` to validate definition contracts and installer behavior.
4. Verify the change still emits TUI-portable output
   (`AGENTS.md:118-131`).

## Install management

The installer is idempotent. Re-run the command when a copy is stale or a
linked destination is broken:

```sh
npx opencode-extras --global
```

Use `--copy` (the default) for coexistence-safe copies or `--link` for live
local development. Test fixtures are created under `~work/` and removed after
the test run unless `KEEP_WORK=1` is set. The `~work` directory and editor
backups (for example `spec.md~`) are git-ignored (`.gitignore:1-2`).

## Scratch state

- `.ai-temp/` is git-ignored working scratch, never committed and never treated
  as a deliverable.
- The [issue-bookmarks skill](../development/skills-reference.md#issue_bookmarks)
  is the only path that writes analyst resume state, and only when the user asks
  for it. It requires the matching analyst to be active and writes either
  `.ai-temp/business-analyst/<name>.md` or
  `.ai-temp/system-analyst/<name>.md` after any overwrite confirmation.
- Its list and load operations are read-only and role-scoped. Each analyst must
  ignore the other analyst's directory. Neither analyst autosaves state.
- Legacy `.ai-temp/business-analyst.yaml` and
  `.ai-temp/system-analyst.yaml` files are ignored and are not migrated.
- `.ai-temp/findings/` is the shared scratch both analysts may read and write:
  `glossary.yaml` holds the project terms the Business Analyst resolved from
  `docs/`, and one note file per topic holds a finding the other analyst would
  otherwise re-derive. Neither file is a bookmark and neither is a deliverable.
- `.ai/*` instruction files are loaded as context by opencode
  (`opencode_cfg.jsonc:35-37`) and are created or updated by the
  [init-project command](../development/commands/init-project.md).

## Keeping documentation in sync

Documentation changes belong in the same changeset as the definitions they
describe. The [documentation skill](../development/skills-reference.md#documentation)
owns the site taxonomy and audit checks; the
[documenter agent](../development/agents-reference.md#documenter) generates
and updates the site under an approval gate (`agents/documenter.md:72-86`).

This documentation site is authored as plain static Markdown and configured
in `properdocs.yml`. When the `properdocs` command is available, run the site's
build as an additional verification. If it is unavailable, use the static
checklist in the documentation skill (structure, links, consistency).

## Housekeeping checklist

- [ ] No tracked dotfiles besides `.gitignore` (`AGENTS.md:102`).
- [ ] No secrets committed; `.envrc` stays untracked (see
  [Security](security.md)).
- [ ] Skills have a `SKILL.md` entrypoint and frontmatter is valid.
- [ ] Analyst bookmark changes keep explicit saves and role-scoped paths.
- [ ] Docs pages match the taxonomy and link correctly.

## Next steps

- Security policy: [Security and compliance](security.md).
- Troubleshooting: [Troubleshooting](troubleshooting.md).
