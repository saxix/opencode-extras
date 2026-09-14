# FAQs and troubleshooting

Who is this for? This page answers common questions from end users of the
toolkit. Operators should also read the
[Administrative troubleshooting page](../admin/troubleshooting.md).

## My new agent does not appear

Configurations are loaded once when the TUI starts. Quit and restart the
assistant. Symlinks point at the repository, so a file created there is
already installed; only the running session is stale.

## A skill never triggers

Skills load on demand when the task matches the skill's `description:`
frontmatter. The description must carry the literal keywords users are likely
to say (`README.md:76`). Check:

- the skill directory has a file named exactly `SKILL.md` (`README.md:75`);
- `name:` and `description:` are present and the description front-loads the
  trigger keywords;
- the TUI was restarted after the change.

## A command shows no behavior

Commands are Markdown prompt bodies under `commands/`. If the command has no
`description:` or `agent:` frontmatter, the TUI runs it with its defaults
(`commands/step-by-step.md`). Restart the TUI after editing the file. A
git-ignored editor backup (for example `commands/~spec-inspect.~md`) is not a
command.

## The install symlinks went stale or broke

Re-run the make target:

```sh
make install-opencode
make install-claude
```

The targets recreate the symlinks under `~/.config/opencode/` and
`~/.claude/skills/` (`Makefile:7-18`). If a path conflicts with an existing
directory, remove the old directory first and re-run make.

## My report renders badly (emoji, wide tables, raw HTML)

Every definition in this repository must produce TUI-portable output: plain
CommonMark, ASCII-first, ATX headings, narrow tables, fenced code blocks, and
no TUI-specific directives (`AGENTS.md:85-98`). Flag the offending definition
or ask the `init-project` / documentation workflows to conform.

## Why is there no application code in this repository?

By design. The repository is purely instruction definitions for coding agents
(`README.md:95`). Features are the definitions themselves, not a runtime.

## Two agents claim the same task

Agents are role-specific. Route discovery to the Business Analyst, technical
design to the System Analyst, implementation to the Coder, and docs to the
Documenter. Passing work to the wrong agent is the usual cause of duplicated
or rejected handoffs (`user-guide/workflows/agents.md`).

## Next steps

- Operator-level problems: [Administrative troubleshooting](../admin/troubleshooting.md).
- Understanding the output standard: [Contribution guidelines](../development/contribution.md).