# Windows multi-repository workspace

Launch OpenCode from your chosen parent workspace after the installation described in
`docs/deploy/installation.md`. The projects remain independent Git repositories. For a standalone
project, launch from its own root; the same definitions work without a parent workspace.

## Starting work

Name the desired outcome and main project. The assistant identifies consulted dependencies
and the repositories authorized for changes, then reads local instructions. Looking at a
shared library does not authorize editing it. For explicit cross-repo work, the plan records
dependency order, contracts, checks per project, and coordinated rollout when necessary.

Each command runs with the target repository as its working directory and uses that project's
Python environment, dependency manager, Django version, database, and validation commands.
Git status, stage, commits, and pushes remain separate per repository. Commit and push require
an explicit user request.

## Sessions and durable records

Starting from one root gives OpenCode a consistent workspace context. Session storage and
project identity are managed by the installed OpenCode version; do not assume history lives
inside the workspace or is automatically read by a new conversation.

By default, deliverables stay in the conversation; reports and prompt logging are optional.
If your local policy requires persisted analysis, define its directory, language, naming, and
matching per-agent permissions as described in `docs/admin/local-policy.md`. For cross-repo
activities, a coordination document can link existing per-project records. Preserve content
when updating them. A report directory may itself be an independent repository; keep its Git
operations separate from application repositories.

Analysts save internal state in `.ai-temp/<repo_key>/<activity_id>/<agent>.yaml`.
Choose a distinct ID for concurrent independent activities. Resume an identified activity;
ask when several snapshots match. Legacy fixed-name snapshots are migrated only when selected,
without deleting the originals. Scratch is not a deliverable and is never committed.

## First validation

Start with an analysis involving one application and one shared library. Verify that the
assistant identifies both roots, reads their local instructions, and keeps the proposed
write scope explicit. Then try a small authorized implementation with separate verification
for each changed repository. Loader checks alone do not prove model behavior on a real task.
