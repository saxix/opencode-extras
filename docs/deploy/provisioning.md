# Provisioning and deployment

Who is this for? This page covers deploying the toolkit across machines and
keeping deployments current.

## Supported target

The installer writes the portable artifacts to the opencode layout. opencode is
the only supported target; `--agent opencode` is accepted for backward
compatibility.

| Scope | Destination |
|---|---|
| Global (default) | `~/.config/opencode` |
| Project (`--project`) | `./.opencode` |

Evidence: [Installation](installation.md), `scripts/install.mjs`.

## Deploying to a new machine

1. Clone the repository:
   ```sh
   git clone <repository-url> agents-skills
   ```
2. Run the applicable install command, for example
   `npx opencode-extras --agent opencode --global`.
3. Export the local credential environment (`.envrc` style; see
   [Environment variables](environment.md)).
4. Restart the TUI.

Installations copy the definitions by default. Use `--link` only when the
installed files should point back to a local checkout.

## Keeping a deployment current

- Pull the repository: `git pull`.
- Re-run the install command when definitions change or the installed copy is
  missing. Linked installations stay valid while the checkout path does not move.
- Restart the TUI after pulling to reload definitions and configs.

## Multiple machines or users

Options:

- Each machine keeps its own checkout (recommended): definitions stay the
  single source of truth, credentials stay per-machine.
- Or share a checkout over a mounted path and point `PREFIX` at each user's
  config home (`PREFIX=... npx opencode-extras --agent opencode --global`).

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
