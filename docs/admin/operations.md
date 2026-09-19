# Maintenance and operations

Who is this for? This page covers day-to-day upkeep of the toolkit: updating
definitions, managing scratch state, and keeping documentation in sync.

## Updating agents, skills, and commands

Definitions live under `src/agents/`, `src/skills/`, `src/commands/`, and
`src/instructions/`. Junctions or symlinks expose the same files to the installed workspace.
After editing:

1. Restart the TUI so it reloads configuration and agent lists.
2. Verify frontmatter: `description:` is required; a skill directory must keep
   a file named exactly `SKILL.md` (`README.md:75-77`).
3. Verify the change still emits TUI-portable output
   (`AGENTS.md:85-98`).

## Symlink management

Re-running the installer accepts matching links but refuses conflicting paths.
Inspect conflicts and preserve user content before deliberately relocating or replacing a link.
On Windows use `scripts/install-opencode.ps1 -Global` or `-WorkspaceRoot <root>`; on Unix:

```sh
make install-opencode
make install-claude
```

`make clean` removes the local test sandbox `~build` (`Makefile:21-22`). The `~build`
directory and editor backups (for example `spec.md~`) are git-ignored
(`.gitignore:1-2`).

## Scratch state

- Snapshot state lives at `.ai-temp/<repo_key>/<activity_id>/<agent>.yaml` at the
  workspace root, separately for each activity. It is never committed or used as a deliverable.
  Verify ignore rules when the containing workspace is tracked.
- The Business Analyst maintains `.ai-temp/<repo_key>/glossary-known-terms.yaml` per repository.
- Persistent working documents and prompt logs require explicit local conventions and
  permissions; otherwise deliverables stay in the conversation. See `local-policy.md`.
- Shared instructions are loaded through the user config's `instructions` array.
  Extra `.ai/*` files created by `init-project` need explicit configuration if they are to be loaded.

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

- [ ] No tracked dotfiles besides `.gitignore` (`AGENTS.md:80`).
- [ ] No secrets committed; `.envrc` stays untracked (see
  [Security](security.md)).
- [ ] Skills have a `SKILL.md` entrypoint and frontmatter is valid.
- [ ] Docs pages match the taxonomy and link correctly.

## Next steps

- Security policy: [Security and compliance](security.md).
- Troubleshooting: [Troubleshooting](troubleshooting.md).