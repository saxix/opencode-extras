# Git workflow and branching

Who is this for? This page documents the version-control conventions observed
in this repository.

## Current state

The repository is a git worktree with a short, linear history. Observed
commits at the time of writing: an `initial commit`, then `updates`
(`git log`). There is no documented branching strategy, no CI, and no release
pipeline; contributors are expected to follow the repo's plain style.

## Conventions

- Commit in small, self-contained changesets. Documentation changes belong in
  the same changeset as the definitions they describe
  (`skills/documentation/SKILL.md`).
- Keep dotfiles out of the index: `.gitignore` excludes all dotfiles and
  editor backups (`~*`), so `.envrc` and `~`-suffixed backups must never be
  committed (`AGENTS.md:103`).
- Never commit credentials; see [Security](../admin/security.md).
- Committing, pushing, or creating branches is not part of the agent
  workflows: the Coder and Documenter do not commit unless explicitly asked
  (`agents/coder.md:25`, `agents/documenter.md:45-51`).
- The toolkit's own agents can be used to draft commit messages and create
  pull requests (see [commit skill](../development/skills-reference.md#commit)
  and [pull-request skill](../development/skills-reference.md#pull-request)).

## Before committing

1. Inspect `git status` and `git diff`; stage only intended files.
2. Verify no secrets or `~`-backup files are staged.
3. Write a concise message that matches the repo style.
4. Confirm hooks and validation pass (this repo has none configured).

## Next steps

- Writing changes: [Contribution guidelines](contribution.md).
- Rolling back an install: [Release and rollback](../deploy/release.md).