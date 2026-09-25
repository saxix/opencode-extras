# Installation

Who is this for? This page is the operational reference for installing the
toolkit into a TUI. End users should start with
[Getting started](../user-guide/getting-started.md).

## Install via npx (recommended)

```sh
npx opencode-utils --global --all              # global ~/.config/opencode/skills/sax-* + ~/.claude/skills/sax-* + ~/.codex/skills/sax-*
npx opencode-utils --project --all             # project ./.opencode/skills/sax-* + ./.claude/skills/sax-* + ./.codex/skills/sax-*
npx opencode-utils --global --opencode         # only opencode
npx opencode-utils --global --claude           # only claude
npx opencode-utils --global --codex            # only codex
npx opencode-utils --project --link --all      # dev live symlinks (opt-in)
npx opencode-utils --project --compat          # project compat ./.agents/skills/sax-* (instead of dedicated folders)
npx opencode-utils --dry-run --global --all    # preview
```

Via `make` (wrapper to `npx`):

```sh
make install              # global --all (copy)
make install-project      # project --all (copy)
make install-opencode     # global opencode only
make install-claude       # global claude only
make install-codex        # global codex only
make install-all          # global opencode+claude+codex
```

Default is `--copy` per-item (safe with other skill packs). Use `--link` for live dev.
The installer never creates a directory symlink (`skills -> src/skills`); it copies
or links per-item (`skills/sax-<name>`) so multiple skill packs can coexist.
Skills are installed with prefix `sax-` to avoid collisions.

## What gets installed

| Repository path | Installed as |
|---|---|
| `src/skills/<name>/` | `DEST/skills/sax-<name>/` |
| `src/agents/*.md` | `DEST/agents/*.md` |
| `src/commands/*.md` | `DEST/commands/*.md` |
| `src/agents/_shared/state-persistence.md` | `DEST/sax/shared/state-persistence.md` (shared spec, not an agent) |

`DEST` is `~/.config/opencode` (global opencode), `~/.claude` (global claude),
`~/.codex` (global codex), or `./.opencode` etc. for `--project`.
With `--project --compat`, `DEST` is `./.agents` -> `./.agents/skills/sax-*`.

### Install from a local clone (dev with --link)

```sh
git clone https://github.com/saxix/opencode-utils.git
cd opencode-utils
# install this clone into itself as project (live symlinks)
node ./scripts/install.mjs --project --link --all
# install this clone into another project
cd /path/to/your/project
node /path/to/opencode-utils/scripts/install.mjs --project --link --all
# compat variant (single .agents)
node /path/to/opencode-utils/scripts/install.mjs --project --compat --link
# verify
ls -l .opencode/skills/sax-security        # symlink -> src/skills/sax-security
ls -l .agents/skills/sax-security          # compat
ls -l .opencode/sax/shared/state-persistence.md  # shared spec (not an agent)
readlink .opencode/skills/sax-security
```

## Custom prefix

All targets support overriding the destination home with `PREFIX`:

```sh
PREFIX=/some/other/home npx opencode-utils --global --all
make PREFIX=/some/other/home install
```

The same mechanism powers the sandbox smoke test (`Makefile:clean/test`).

## After install

1. Restart the TUI so it reloads configuration and agent lists.
2. Verify agents, skills, and commands are visible
   ([Interface navigation](../user-guide/navigation.md)).
3. Create the local credentials file if the ticketing servers will be used
   ([Environment variables](environment.md)).

## Uninstall

```sh
npx opencode-utils --uninstall --global --all
npx opencode-utils --uninstall --project --all
npx opencode-utils --uninstall --project --compat
make uninstall
```

## Next steps

- Per-TUI deployment details: [Provisioning and deployment](provisioning.md).
- Environment variables: [Environment variables](environment.md).