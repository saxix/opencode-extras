# Release and rollback

Who is this for? This page documents how a release happens for this toolkit
and how to roll back an installation.

## Current release process

There is no automated release pipeline. Observed evidence:

- repository history is two commits: `initial commit` and `updates`
  (`git log`);
- no git tags exist (`git tag` is empty);
- the repository declares it contains no CI (`AGENTS.md:133-135`).

Releases are therefore manual: a "release" is a commit that updates the
definitions. The toolkit itself ships a
[release skill](../development/skills-reference.md#release) for generating
release notes and GitHub releases in the projects it drives, but it does not
run against this repository.

## Installing a given version

The default installation copies definitions from the checkout. Refresh a copy
after updating or checking out a version:

```sh
git pull
npx opencode-extras --agent opencode --global
```

Linked installations follow the checkout automatically, but must be refreshed
if their destination path moves. Restart the TUI after installing.

## Rollback

To roll back a copy installation, check out the previous version and rerun the
installer:

```sh
git checkout <previous-commit-or-branch>
npx opencode-extras --agent opencode --global
```

Restart the TUI afterwards. For a linked installation, checking out the
previous version changes the linked files without rerunning the installer. If
the checkout directory moves, rerun the install with `--link`.

## Versioning guidance

- Tag releases if consumers need stable references: `git tag <version>`.
- Keep restricted write surfaces in mind: only the
  [documenter agent](../development/agents-reference.md#documenter) may touch
  documentation, and no agent commits without an explicit request
  (`agents/coder.md:25`).

## Next steps

- Keeping a deployment current: [Provisioning and deployment](provisioning.md).
- Repository history conventions: [Git workflow](../development/git-workflow.md).
