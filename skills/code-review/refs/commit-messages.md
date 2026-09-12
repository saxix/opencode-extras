---
title: "Commit Messages"
description: "We have very precise rules over how our git commit messages can be formatted. This leads to more readable messages that are easy to follow when looking through the project history."
url: https://github.com/saxix/agents-skills/skills/code-review/refs/commit-messages.md
---

# Commit Messages

### [General Rules](#general-rules)

1. Separate subject from body with a blank line
2. Limit the subject line to 70 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
6. Use the body to explain what and why vs. how
7. Each commit should be a single, stable change

### [Squash Merge](#squash-merge)

Enforce **squash-merge** for all pull requests into the default branch. This means that regardless of how many commits your feature branch has, they will be combined into a single commit when merged. The resulting commit message is what matters -- it should follow the commit message format described below.

Because of this, you do **not** need to keep your branch's individual commits clean or rebased. Feel free to commit incrementally, use fixup commits, or have "WIP" messages during development -- they will all be squashed away on merge.

#### [Updating Your Branch](#updating-your-branch)

When your branch is behind the default branch, we advise **merging** main into your branch over rebasing:

* **Merge** preserves the existing commit history and, importantly, keeps the context of already-reviewed changes intact. Reviewers can see only the new changes since their last review.
* **Rebase** rewrites your branch's commit history, which makes every commit appear new to reviewers and loses the ability to see incremental changes. This is especially disruptive on PRs that have already received review feedback.

#### [Squashing a Merge Commit Message](#squashing-a-merge-commit-message)

When squash-merging via GitHub's UI, consider taking this opportunity to craft a clear final commit message that follows the commit guidelines below. The default squash-merge message varies by repository -- some use the PR title and description, while others concatenate all individual commit messages.

### [Commit Message Format](#commit-message-format)

Each commit message consists of a **header**, a **body**, and an optional **footer**.

The header has a special format that includes a type, a scope and a subject:

```bash
<type>(<scope>): <subject> (<linear-id>)
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
<agents>
```

The **header** is mandatory and the **scope** of the header is optional. If you have a Linear issue to link to, add the **linear-id** the commit belongs to. This helps to connect changes back to Liner tickets.

Any line of the commit message should not be longer than 100 characters! This allows the message to be easier to read on GitHub as well as in various git tools.

The footer should contain a closing reference to an issue as well as a relevant issue if any.

For example:

```bash
feat(stream): Add resolve in next release action

Expose a new action labeled 'resolve in next release'. It uses the existing API
behavior and sends the 'inNextRelease=true' payload.

Fixes GH-1234
```

As well as:

```bash
fix(stream): Handle empty reference on resolve action

Gracefully handle when a user has not selected any issues and tries to complete
the resolve action in the UI.

Fixes GH-1234
```

#### [Revert](#revert)

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

#### [Type](#type)

Must be one of the following:

| build:   | Changes that affect the build system or external dependencies (example scopes: webpack, python, npm)                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ci:      | Changes to our CI configuration files and scripts (example scopes: travis, zeus)                                                     |
| docs:    | Documentation only changes                                                                                                           |
| feat:    | A new feature                                                                                                                        |
| fix:     | A bug fix                                                                                                                            |
| perf:    | A code change that improves performance                                                                                              |
| ref:     | A code change that neither fixes a bug nor adds a feature (refactor)                                                                 |
| chore:   | Necessary changes for qualitative improvements that don't affect functionality, e.g. updating dependencies or adding instrumentation |
| style:   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)                               |
| test:    | Adding missing tests or correcting existing tests                                                                                    |
| meta:    | Some meta information in the repo changes (example scopes: owner files, editor config etc.)                                          |
| license: | Changes to licenses                                                                                                                  |

#### [Scope](#scope)

The scope should be the name of the core component affected (as perceived by someone reading the changelog generated from commit messages). This means it should be the system impacted, not the literal file changed. For example, if the code primarily affects billing, you'd use the *billing* scope, even if the changes are in utility files or db schema.

The following is the list of suggested scopes:

* **api**
* **auth**
* **billing**
* **dashboards**
* **discover**
* **integrations**
* **ui**
* **workflow**

It is also acceptable to use the feature/project name as a scope.

#### [Subject](#subject)

The subject contains a succinct description of the change:

* Use the imperative, present tense: "change" not "changed" nor "changes"
* Capitalize the first letter
* No dot (.) at the end

#### [Body](#body)

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

#### [Footer](#footer)

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

Breaking Changes should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

#### [Agents](#agents)

The agents section should contain any information about AI agent/model used to write the code in the format `Co-Authored-By: <MODEL> (<AGENT>)`.

Es.
```
Co-Authored-By:  Claude Sonnet 4.6 (Claude Code)
Co-Authored-By:  DeepSeek V4 Flash (opencode)

```




References

* <https://chris.beams.io/posts/git-commit/>
* <https://conventionalcommits.org/>
* <https://github.com/angular/angular/blob/master/CONTRIBUTING.md>
