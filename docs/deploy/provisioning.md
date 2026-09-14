# Provisioning and deployment

Who is this for? This page covers deploying the toolkit across TUIs and
machines, and keeping deployments current.

## Per-TUI support matrix

| Artifact | opencode | Claude Code | Other TUIs |
|---|---|---|---|
| Agents | yes | no | portable Markdown, per-TUI frontmatter ignored |
| Skills | yes | yes | portable Markdown |
| Commands | yes | no | portable Markdown |
| Global/TUI configs | yes | no | not applicable |

Evidence: [Installation](installation.md), `README.md:77`.

## Deploying to a new machine

1. Clone the repository:
   ```sh
   git clone <repository-url> agents-skills
   ```
2. Run the applicable install target (`make install-opencode` and/or
   `make install-claude`).
3. Export the local credential environment (`.envrc` style; see
   [Environment variables](environment.md)).
4. Restart the TUI.

Because installs are symlinks back to a single checkout, there is no
deployment artifact to version: updating the checkout updates the install.

## Keeping a deployment current

- Pull the repository: `git pull`.
- Re-run the install targets only if the symlinks are missing or broken; the
  symlinks themselves stay valid while the checkout path does not move.
- Restart the TUI after pulling to reload definitions and configs.

## Multiple machines or users

Options:

- Each machine keeps its own checkout (recommended): definitions stay the
  single source of truth, credentials stay per-machine.
- Or share a checkout over a mounted path and point `PREFIX` at each user's
  config home (`make PREFIX=... install-opencode`).

Never commit credentials when provisioning (see
[Security](../admin/security.md)).

## Reserved components

- `plugins/` is reserved for TUI plugins and is currently empty.
- `.ai/*` instruction files are loaded as context by opencode when present
  (`opencode_cfg.jsonc:35-37`); provisioning a project with
  `init-project` creates them.

## Next steps

- Credential configuration: [Environment variables](environment.md).
- Keeping the install healthy: [Maintenance and operations](../admin/operations.md).