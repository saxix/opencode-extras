# Installation

Who is this for? This page is the operational reference for installing the
toolkit into a TUI. End users should start with
[Getting started](../user-guide/getting-started.md).

## Install via npx (recommended)

The default target is `opencode`, installed globally:

```sh
npx opencode-utils
npx opencode-utils --project
npx opencode-utils --agent claude --global
npx opencode-utils --agent codex --project
npx opencode-utils --agent pi --global
npx opencode-utils --agent compat
npx opencode-utils --agent opencode --link
npx opencode-utils --dry-run --agent opencode --global
```

`--agent compat` selects the project `.agents` layout and implies `--project`.
Use `--agent` with one target per invocation; `opencode` is the default.

Default is `--copy` per-item (safe with other skill packs). Use `--link` for symlink
installs. For live updates, use a local checkout. The installer never creates a
directory symlink (`skills -> src/skills`); it copies
or links per-item (`skills/sax-<name>`) so multiple skill packs can coexist.
Skills are installed with prefix `sax-` to avoid collisions. Use `--agent compat`
for the project `.agents` layout.

## Install from GitHub

Run the default branch directly from GitHub without a published npm release:

```sh
npx --yes github:saxix/opencode-utils --project --agent opencode
```

**Warning:** `npx github:... --link` points the symlinks to the package copy/cache
managed by `npx`, not to a local Git checkout. Existing links do not update when the
remote branch changes. Use the local checkout workflow below for live development.

## What gets installed

| Repository path | Installed as |
|---|---|
| `src/skills/<name>/` | `DEST/skills/sax-<name>/` |
| `src/agents/*.md` | `DEST/agents/*.md` |
| `src/commands/*.md` | `DEST/commands/*.md` |
| `src/_shared/` | `DEST/_shared/` (shared specs; any top-level `src/` dir outside agents, skills, and commands is mirrored under the same name) |

`DEST` is `~/.config/opencode` (global opencode), `~/.claude` (global claude),
`~/.codex` (global codex), `~/.pi` (global pi), or `./.opencode` etc. for
`--project`. With `--agent compat`, `DEST` is `./.agents` and the command
implies `--project`.

### Install from a local clone (dev with --link)

For a local checkout, use `node` to install directly from this working tree:

```sh
git clone https://github.com/saxix/opencode-utils.git
cd opencode-utils
node ./scripts/install.mjs --project --link --agent opencode
cd /path/to/your/project
node /path/to/opencode-utils/scripts/install.mjs --project --link --agent opencode
node /path/to/opencode-utils/scripts/install.mjs --agent compat --link
ls -l .opencode/skills/sax-security
ls -l .agents/skills/sax-security
readlink .opencode/skills/sax-security
```

## Custom prefix

All targets support overriding the destination home with `PREFIX`:

```sh
PREFIX=/some/other/home npx opencode-utils --agent opencode --global
```

The same mechanism powers the installer tests. The Node test suite uses an isolated
`PREFIX` sandbox under `~work/`.

## After install

1. Restart the TUI so it reloads configuration and agent lists.
2. Verify agents, skills, and commands are visible
   ([Interface navigation](../user-guide/navigation.md)).
3. Create the local credentials file if the ticketing servers will be used
   ([Environment variables](environment.md)).

## Uninstall

```sh
npx opencode-utils --uninstall --agent opencode --global
npx opencode-utils --uninstall --project --agent opencode
npx opencode-utils --uninstall --agent compat
```

## Next steps

- Per-TUI deployment details: [Provisioning and deployment](provisioning.md).
- Environment variables: [Environment variables](environment.md).