# Testing strategy

Who is this for? This page explains how changes to this repository are
validated.

## Test suite

The repository ships a minimal test suite for the installer, definition
contracts, and the analyst bookmark skill (`tests/install.test.mjs:1`,
`package.json: scripts.test`):

```sh
npm test          # node --test: definition contracts + installer per-item tests
```

`npm test` covers:
- all 26 skills have valid `name`/`description`, a root `SKILL.md`, and quoted
  descriptions when they contain `:`;
- every agent and every command that declares frontmatter has valid
  frontmatter; all 8 command files are non-empty;
- the retired `issue-save`, `issue-load`, and `issue-list` commands are gone and the
  `issue-bookmarks` skill enforces the two analyst roles, validated names, the
  shared compact persistence contract, and one validity rule set;
- each analyst loads the `issue-bookmarks` and `state-persistence` skills and
  names only its own bookmark directory;
- both analysts are granted read, glob, and edit on `.ai-temp/findings/**` and
  nothing broader under `.ai-temp/`;
- every subagent and skill an analyst names in its body is reachable through a
  matching permission (guards against a documented path that is hard-denied);
- the System Analyst explicitly denies `edit` on the glossary cache it must
  never write;
- a golden analyst-flow set (`tests/golden-cases.mjs`, run by
  `tests/golden-analyst-flow.test.mjs`) verifies the end-to-end promises of the
  two analysts as rule-based invariants: the two approval gates, the three
  requirement forms, both publication destinations, the lightweight bookmark
  contract, the per-analyst split, the enforced glossary owner, and the
  resilience fallbacks;
- the installer removes retired command files on install and uninstall, and
  never installs editor backups or dotfiles from `src/`;
- installer `scripts/install.mjs:1` behavior: per-item copy/link, coexistence
  (`other-pack` preserved), `PREFIX` isolation, `--dry-run`, `--uninstall`,
  global/project scope, and rejection of removed selector flags.

The tests use isolated temporary prefixes and clean them up automatically. Set
`KEEP_WORK=1` when inspecting the test fixtures under `~work/`. The directory
is git-ignored (`.gitignore:1`).

## Definition validation

Changes to agents, skills, and commands are validated both by tests and
manually against conventions:

| Check | Criterion |
|---|---|
| Skill entrypoint | `SKILL.md` exists at the skill directory root (`AGENTS.md:97`) |
| Frontmatter | `name:`/`description:` for skills; `description:` for agents and commands (`AGENTS.md:97-99`) |
| Output standard | Content follows the TUI-portable standard (`AGENTS.md:118-131`) |
| Permissions | Deny-first, allow-last convention and a restricted write surface |
| Bookmark safety | Active role, paths, names, overwrite, and explicit-only save |
| Docs consistency | Documentation changes match the docs taxonomy (`skills/documentation/SKILL.md`) |

For TUI behavior, open a session in this repository and trigger the changed
agent, skill, or command; then restart to confirm it reloads.

## Golden analyst flows

`tests/golden-cases.mjs` is the regression baseline for the analyst pipeline. It
is a list of cases, each stating one end-to-end promise and the rule-based
invariant that verifies it, and `tests/golden-analyst-flow.test.mjs` runs every
case. The evaluators are rule-based on purpose: the two analysts are `primary`
agents, they are not runnable as subagents, and no ticketing provider is
configured in the test environment, so a live generation step is not available.
The set validates the contract a live run must satisfy, not sampled output.

Each case carries an `id`, a `scenario`, a `rationale`, a `source`, and one or
more `checks` (`match`, `notMatch`, `count`, `balancedFences`, `ascii`). When a
change touches the analysts, the `ticket-writing` skill, or the
bookmark/state skills:

1. Run the golden set on the old definitions to record the baseline.
2. Apply the change and run it again.
3. A case that flips to failing is a regression: fix the definition or update
   the case deliberately, never to make a red test green by accident.

To prove a case is still effective, mutate the definition it guards (for
example, rename the creation-approval question) and confirm the case fails; then
restore the definition.

## When more tests appear

If a future change introduces real code (for example a plugin), extend
`tests/` with an appropriate suite; the current suite is minimal and focused
on the installer.

## Next steps

- Authoring rules in detail: [Contribution guidelines](contribution.md).
- Conventions audit: [Maintenance and operations](../admin/operations.md).