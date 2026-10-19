# Installation

Who is this for? This page is the operational reference for installing the
toolkit into opencode. End users should start with
[Getting started](../user-guide/getting-started.md).

## Install via npx (recommended)

The installer targets opencode, globally by default:

```sh
npx opencode-extras                              # global (~/.config/opencode)
npx opencode-extras --project                    # project (.opencode)
npx opencode-extras --link
npx opencode-extras --dry-run --global
```

opencode is the only supported target; there is no target selector (`--agent`
was removed).

Default is `--copy` per-item (safe with other skill packs). Use `--link` for symlink
installs. For live updates, use a local checkout. The installer never creates a
directory symlink (`skills -> src/skills`); it copies
or links per-item (`skills/sax-<name>`) so multiple skill packs can coexist.
Skills are installed with prefix `sax-` to avoid collisions.

## Install from GitHub

Run the default branch directly from GitHub without a published npm release:

```sh
npx --yes github:saxix/opencode-extras --project
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

`DEST` is `~/.config/opencode` for global installs or `./.opencode` for
`--project`.

### Install from a local clone (dev with --link)

For a local checkout, use `node` to install directly from this working tree:

```sh
git clone https://github.com/saxix/opencode-extras.git
cd opencode-extras
node ./scripts/install.mjs --project --link
cd /path/to/your/project
node /path/to/opencode-extras/scripts/install.mjs --project --link
ls -l .opencode/skills/sax-security
readlink .opencode/skills/sax-security
```

## Custom prefix

The destination home can be overridden with `PREFIX`:

```sh
PREFIX=/some/other/home npx opencode-extras --global
```

The same mechanism powers the installer tests. The Node test suite uses an isolated
`PREFIX` sandbox under `~work/`.

## After install

1. Restart opencode so it reloads configuration and agent lists.
2. Verify agents, skills, and commands are visible
   ([Interface navigation](../user-guide/navigation.md)).
3. Create the local credentials file if the ticketing servers will be used
   ([Environment variables](environment.md)).

## Uninstall

```sh
npx opencode-extras --uninstall --global
npx opencode-extras --uninstall --project
```

## Next steps

- Scope and destinations: [Interface navigation](../user-guide/navigation.md).
- Environment variables: [Environment variables](environment.md).
