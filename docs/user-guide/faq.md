# FAQs and troubleshooting

Who is this for? This page answers common questions from end users of the
toolkit. Operators should also read the
[Administrative troubleshooting page](../admin/troubleshooting.md).

## My new agent does not appear

Configurations are loaded once when the TUI starts. Quit and restart the
assistant. Copy installations must be refreshed with `npx opencode-extras`; linked
installations update from the checkout automatically.

## A skill never triggers

Skills load on demand when the task matches the skill's `description:`
frontmatter. The description must carry the literal keywords users are likely
to say (`README.md:156`). Check:

- the skill directory has a file named exactly `SKILL.md` (`README.md:180`);
- `name:` and `description:` are present and the description front-loads the
  trigger keywords;
- the TUI was restarted after the change.

## A command shows no behavior

Commands are Markdown prompt bodies under `commands/`. If the command has no
`description:` or `agent:` frontmatter, the TUI runs it with its defaults
(`commands/step-by-step.md`). Restart the TUI after editing the file. A
git-ignored editor backup (for example `commands/~spec-inspect.~md`) is not a
command.

## The installed copy is stale or missing

Re-run the install command for the selected target:

```sh
npx opencode-extras
npx opencode-extras --agent claude
npx opencode-extras --agent codex
npx opencode-extras --agent pi
```

Use `--agent compat` for the project `.agents` layout, or pass `--link` when
the installed files should follow a local checkout. If a path conflicts with an
existing directory, remove the old directory first and retry.

## My report renders badly (emoji, wide tables, raw HTML)

Every definition in this repository must produce TUI-portable output: plain
CommonMark, ASCII-first, ATX headings, narrow tables, fenced code blocks, and
no TUI-specific directives (`AGENTS.md:118-131`). Flag the offending definition
or ask the `init-project` / documentation workflows to conform.

## Why is there no application runtime in this repository?

By design. The repository contains a small installer and tests, but its primary
content is instruction definitions for coding agents (`README.md:198-200`).
Features are the definitions themselves, not a runtime.

## Two agents claim the same task

Agents are role-specific. Route discovery to the Business Analyst, technical
design to the System Analyst, implementation to the Coder, and docs to the
Documenter. Passing work to the wrong agent is the usual cause of duplicated
or rejected handoffs (`user-guide/workflows/agents.md`).

## Next steps

- Operator-level problems: [Administrative troubleshooting](../admin/troubleshooting.md).
- Understanding the output standard: [Contribution guidelines](../development/contribution.md).
