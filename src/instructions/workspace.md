# Shared workspace operating rules

These optional rules support both standalone projects and workspaces containing independent
repositories. In standalone mode, the project root is the working root; no parent workspace
or central report directory is required. In multi-repository mode, use the explicitly selected
workspace root. Read applicable `AGENTS.md` files and follow local conventions. Repository
instructions refine these defaults for their files; report material conflicts.

## Establish scope before acting

- Identify the workspace root, the primary repository, repositories to consult, and
  repositories explicitly authorized for modification. Resolve ambiguous scope with the user.
- Read each involved repository's `AGENTS.md` and any instructions along the path to the
  affected files. Do not assume launching at the workspace root loaded nested instructions.
- Reading a dependency to understand impact does not authorize changing it.
- For cross-repository work, record dependency order, contracts to preserve, per-repository
  verification, and the coordinated rollout when relevant. Implement repository by repository.
- Give subagents explicit repository roots, a bounded question, and relevant local rules.
  Subagent documentation paths such as `docs/` are relative to that assigned repository.

## Commands and environments

- Set the tool's working directory to the actual repository for every Git, Python, test,
  build, and migration command. A parent workspace does not merge its projects' Git histories.
  In standalone mode these commands naturally run in the project root.
- Inspect each repository's branch and working tree before changing it; preserve existing work.
- Determine supported Python/Django versions, package manager, virtual environment, database,
  and test commands from local instructions, README, lockfiles, and project configuration.
- Use the project's existing runner (PDM, uv, Poetry, tox, activated venv, Docker, or another
  documented tool). Do not install or migrate tooling merely to match a skill example.
- A dependency lower bound is not evidence of the installed version. Use the resolved
  environment or lockfile when available and preserve the project's supported versions.
- On Windows use PowerShell-compatible commands, quoted paths, and explicit working
  directories. Do not assume Bash, direnv, Unix executables, or a shared Python environment.
- Never commit or push unless explicitly requested. Stage only intended files and keep
  commits separate per repository. A request to push is not permission to include unrelated work.

## Durable context

- Session history is not shared memory across new conversations. Consult the workspace's
  persisted analysis, plan, and outcome documents when resuming an activity.
- Default to conversation deliverables in the user's language. Persist reports or prompt logs
  only under an explicit local policy, using its directory, language, naming, and update rules.
  Directory names and logging requirements belong to the deployment, not these shared rules.
  Agent prompts do not grant tool access: configure matching per-agent permissions locally.
- Distinguish published working documents from internal analyst snapshots.
- Select a stable `activity_id` (ticket ID or descriptive slug, with a distinct suffix for
  concurrent independent work) and a workspace-relative `repo_key` that uniquely identifies
  the primary repository. Use safe path components, not absolute paths or `..`.
- Save snapshots under `.ai-temp/<repo_key>/<activity_id>/<agent>.yaml` at the working root.
  Store the primary, consulted, and writable repository roots in the snapshot. A cross-repo
  activity shares its ID but does not overwrite another activity's snapshot.
- A glossary cache lives at `.ai-temp/<repo_key>/glossary-known-terms.yaml`; do not mix terms
  from different repositories. Merge existing entries when saving.
- Resume only an unambiguous activity. If several snapshots match, ask which one to resume.
  Legacy fixed-name snapshots are read only on explicit selection and migrated without
  deleting the original. Do not silently overwrite another session's state.
- Scratch is never a deliverable or committed. If the workspace is itself tracked, ensure
  `.ai-temp/` is ignored before saving. Do not assume this toolkit's gitignore covers its parent.
- Analyst agents may write their snapshots and explicitly configured, permitted analysis/prompt
  documents, but not application code or configuration. A read-only mode takes precedence.

## Verification and handoff

- Verify each changed repository with its actual tools; report commands, working directories,
  outcomes, and unavailable checks. Run cross-repository compatibility checks when warranted.
- Update an activity record when configured locally; otherwise report outcomes in the conversation.
- Do not declare a coordinated change complete based only on tests in one participating repo.
