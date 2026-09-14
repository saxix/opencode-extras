# git-status

Explains, in plain words, what the pending changes in the repository are
trying to achieve (`commands/git-status.md:2`).

## Details

| Field | Value |
|---|---|
| Frontmatter | `description:` Explain what the pending git changes are trying to do |
| Agent | default |
| Input | Optional scope through `$ARGUMENTS` |

## Behavior

Runs read-only `git` diagnostics (`status`, `log`, `diff`, `diff --staged`)
and reads the actual diffs, not just the file names. It groups the files that
serve a single purpose and explains, per change set, the goal the author is
pursuing with evidence from the diff. It flags risky or unfinished work and
secrets as a pre-commit check, and stops with a one-line note when the working
tree is clean. It never stages, commits, pushes, or changes branches.

## Related

- [Git workflow](../git-workflow.md)
- [commit skill](../skills-reference.md#commit)
- [code-review skill](../skills-reference.md#code-review)