---
description: Create or update `AGENTS.md` and `.ai/*` files
agent: build
#model: anthropic/claude-3-5-sonnet-20241022
---

Analyze this repository and create (or update) the agent documentation set under `.ai/` in the project root. The topic list, the resolution order, and the `AGENTS.md` reference block are owned by the `sax-project-context` skill; load it and do not extend the list. If that skill cannot be loaded, stop and report it instead of inventing a topic list.

Instead of a single `AGENTS.md`, write one Markdown file per topic:

| File                     | Topic                                    |
|--------------------------|------------------------------------------|
| `.ai/project.md`         | Project Description                      |
| `.ai/architecture.md`    | Architecture                             |
| `.ai/best-practices.md`  | Best Practices and Code Conventions      |
| `.ai/technical.md`       | Technical Infos (language, framework)    |
| `.ai/testing.md`          | Testing Rules                            |

The goal is a set of compact instruction files that help future OpenCode sessions avoid mistakes and ramp up quickly. Every line should answer: "Would an agent likely miss this without help?" If not, leave it out.

User-provided focus or constraints (honor these):


## How to investigate

Read the highest-value sources first:
- `README*`, root manifests, workspace config, lockfiles
- build, test, lint, formatter, typecheck, and codegen config
- CI workflows and pre-commit / task runner config
- existing instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`, `.ai/*.md`)
- repo-local OpenCode config such as `opencode.json`

If architecture is still unclear after reading config and docs, inspect a small number of representative code files to find the real entrypoints, package boundaries, and execution flow. Prefer reading the files that explain how the system is wired together over random leaf files.

Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify.

## What goes into which file

Split findings by topic; never duplicate a fact across files -- put it where it fits best and cross-reference with a short pointer if needed.

- `.ai/project.md`: what the product/tool is, who it serves, main features, repo layout overview, branch/deploy model.
- `.ai/architecture.md`: package/app boundaries, ownership of major directories, real entrypoints, execution flow, data flow, monorepo or multi-package structure.
- `.ai/best-practices.md`: repo-specific style and workflow conventions that differ from defaults, code-review/pre-commit expectations, do/don't rules agents would otherwise guess wrong.
- `.ai/technical.md`: exact language and version constraints, frameworks and key libraries, toolchain quirks (generated code, migrations, codegen, build artifacts), required env vars/services, dev-server and infra/deploy flow, exact developer commands especially non-obvious ones, required command order such as `lint -> typecheck -> test`.
- `.ai/testing.md`: how to run tests (full suite, single test/package), fixtures and helpers locations, integration prerequisites (databases, caches, browsers), snapshot workflows, flaky or expensive suites, coverage requirements.

## Questions

Only ask the user questions if the repo cannot answer something important. Use the `question` tool for one short batch at most.

Good questions:
- undocumented team conventions
- branch / PR / release expectations
- missing setup or test prerequisites that are known but not written down

Do not ask about anything the repo already makes clear.

## AGENTS.md reference block

After creating or updating the topic files, make sure `AGENTS.md` contains one
`## Project context` block that lists only the files you created, using the
template in the `sax-project-context` skill. Add missing entries, remove
dead ones, and never reference a file that does not exist. If `AGENTS.md` does
not exist, create it with a short project summary plus that block.

## Writing rules

Include only high-signal, repo-specific guidance such as:
- exact commands and shortcuts the agent would otherwise guess wrong
- architecture notes that are not obvious from filenames
- conventions that differ from language or framework defaults
- setup requirements, environment quirks, and operational gotchas
- references to existing instruction sources that matter

Exclude:
- generic software advice
- long tutorials or exhaustive file trees
- obvious language conventions
- speculative claims or anything you could not verify
- empty sections: if a topic has nothing repo-specific to say, still create the file but state explicitly that defaults apply

When in doubt, omit.

Prefer short sections and bullets. Each file must start with a `# <Topic>` heading matching its purpose. Keep every file self-contained and small enough to read in one screen or two.

If the `.ai/` folder already exists at the project root, improve the existing files in place rather than rewriting blindly. Preserve verified useful guidance, delete fluff or stale claims, and reconcile everything with the current codebase. If a legacy `AGENTS.md` exists, migrate any still-valid content into the new files and note in your summary that it can be deleted.
