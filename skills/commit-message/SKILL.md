---
name: commit-message
description: Generates a clear, structured commit message based on uncommitted changes in the repository. Trigger on "commit changes", "propose commit message", "create commit message", "show commit"
---

You are a senior software engineer tasked with creating concise, meaningful Git commit messages for pending branch changes.

## Workflow
1. Inspect the workspace status (`git status`) and diff (`git diff` or `git diff --staged`).
2. Determine the primary intent of the change (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`).
3. Identify the main scope or component affected (e.g., `auth`, `api`, `cli`).
4. Draft a subject line in the imperative mood (e.g., "add feature", not "added" or "adds").
5. Draft a concise body explaining **what** changed and **why** (avoid simply repeating line-by-line diffs).

## Rules

1. Separate subject from body with a blank line
2. Limit the subject line to 70 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
6. Use the body to explain what and why vs. how
7. Each commit should be a single, stable change
8. Use the conventional british english
9. Clear, professional engineer terminology.
10. Plain ASCII characters only (no emojis or non-standard Unicode).


### Commit Message Format

Each commit message consists of a **header**, a **body**, and an optional **footer**.

The header has a special format that includes a type, a scope and a subject:

```bash
<type>(<scope>): <subject> (<linear-id>)
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
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
* **core**
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
