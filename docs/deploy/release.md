# Release and rollback

Who is this for? This page documents how a release happens for this toolkit
and how to roll back an installation.

## Current release process

There is no automated release pipeline. Observed evidence:

- repository history is two commits: `initial commit` and `updates`
  (`git log`);
- no git tags exist (`git tag` is empty);
- the repository declares it contains no CI (`README.md:95`).

Releases are therefore manual: a "release" is a commit that updates the
definitions. The toolkit itself ships a
[release skill](../development/skills-reference.md#release) for generating
release notes and GitHub releases in the projects it drives, but it does not
run against this repository.

## Installing a given version

Because install targets are symlinks to a checkout
([Installation](installation.md)), the installed version is always the
checkout version:

```sh
git pull                 # update the checkout
make install-opencode    # repair symlinks if needed (idempotent)
```

Then restart the TUI to reload. The symlink target stays valid as long as the
checkout path does not move ([Provisioning](provisioning.md)).

## Rollback

Installed copies are never separate; rolling back means moving the checkout to
a previous state:

```sh
git checkout <previous-commit-or-branch>
make install-opencode   # optional; symlinks usually still valid
```

Restart the TUI afterwards. To pin an entire deployment, tag the checkout and
check out the tag. If the checkout directory itself moves, re-run the install
targets to recreate the symlinks.

## Versioning guidance

- Tag releases if consumers need stable references: `git tag <version>`.
- Keep restricted write surfaces in mind: only the
  [documenter agent](../development/agents-reference.md#documenter) may touch
  documentation, and no agent commits without an explicit request
  (`agents/coder.md:25`).

## Next steps

- Keeping a deployment current: [Provisioning and deployment](provisioning.md).
- Repository history conventions: [Git workflow](../development/git-workflow.md).