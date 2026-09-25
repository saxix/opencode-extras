# Command workflows

Who is this for? This page explains how to use the standalone slash commands
that ship with the toolkit. Each command is a constrained prompt body invoked
by name; user input is passed through `$ARGUMENTS`
(for example `commands/devils-advocate.md:10`).

## Command list

| Command | Purpose | Agent |
|---|---|---|
| [debug-code](../../development/commands/debug-code.md) | Debug failures/bugs with a root-cause fix loop | build |
| [devils-advocate](../../development/commands/devils-advocate.md) | Adversarial review of a proposal | default |
| [eli5](../../development/commands/eli5.md) | Explain a concept from first principles | default |
| [humanize](../../development/commands/humanize.md) | Rewrite text without corporate or AI markers | default |
| [init-project](../../development/commands/init-project.md) | Create or update `AGENTS.md` and `.ai/*` files | build |
| [new-spec](../../development/commands/new-spec.md) | Create or refine a feature spec in `.specs/` | spec |
| [step-by-step](../../development/commands/step-by-step.md) | Deconstruct a task into an idempotent sequential plan | default |
| [truthmode](../../development/commands/truthmode.md) | Strict empirical rigor and epistemic calibration | default |
| [git-status](../../development/commands/git-status.md) | Explain what the pending git changes are trying to do | default |
| [issue-save](../../development/commands/issue-save.md) | Save active analyst work as a named bookmark | active analyst |
| [issue-load](../../development/commands/issue-load.md) | Load a named analyst bookmark | active analyst |
| [issue-list](../../development/commands/issue-list.md) | List bookmarks for the active analyst | active analyst |

The table reflects the frontmatter in `commands/*.md`. Commands without an
`agent:` key run in the TUI's current session. The bookmark commands rely on
that behavior and first verify that the loaded agent is exactly
`business-analyst` or `system-analyst`.

## How to use them

1. Invoke the command by name in your TUI and append your input (a proposal, a
   text to rewrite, a task, an idea).
2. The command body applies a set of constraints to your input
   (`$ARGUMENTS`).
3. Most commands are stateless: they take the input, apply the format or
   reasoning constraints, and return the result.
4. The three analyst bookmark commands are the exception. They use the active
   session, require an analyst role, and operate only on that analyst's named
   `.ai-temp/` bookmarks.

## Example flows

- **Review a proposal adversarially.** Pass the proposal to `devils-advocate`.
  It must identify unstated assumptions, worst-case failure modes, the
  strongest counter-strategy, and concrete counterarguments
  (`commands/devils-advocate.md:3-10`).
- **Explain a topic to a beginner.** Pass the topic to `eli5`. It assumes zero
  prior background, removes jargon, and focuses on why something works
  (`commands/eli5.md:3-8`).
- **Clean up a draft.** Pass the draft to `humanize`. It strips corporate
  throat-clearing and bans AI markers such as "delve" and "leverage"
  (`commands/humanize.md:3-9`).
- **Plan a task idempotently.** Pass the task to `step-by-step`. Every step
  must contain exactly one actionable operation plus an explicit verification
  check (`commands/step-by-step.md:3-9`).
- **Get calibrated reasoning.** Pass a claim to `truthmode`. It separates
  verifiable facts from speculation and assigns confidence levels
  (`commands/truthmode.md:3-9`).
- **Start or reshape project instructions.** Run `init-project` to create or
  update `AGENTS.md` and `.ai/*` files (`commands/init-project.md:2-3`).
- **Manage a feature spec.** Pass a TICKET-ID and an idea to `new-spec` to
  create or refine a feature spec in `.specs/` (`commands/new-spec.md`).
- **Debug a failure.** Run `debug-code` to trigger a root-cause fix loop
  (`commands/debug-code.md`).
- **Save analyst work.** While the Business Analyst or System Analyst is active,
  run `issue-save ticket-refinement`. Use `issue-list` to find the name and
  `issue-load ticket-refinement` to resume it in a later session.

## Next steps

- Full behavior for each command is documented in the linked reference pages.
- Author a new command: [Contribution guidelines](../../development/contribution.md).