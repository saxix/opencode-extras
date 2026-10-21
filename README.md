# opencode-extras

Reusable **agents**, **skills**, and **commands** for the
[opencode](https://opencode.ai) terminal assistant. Typeset as plain Markdown
with a portable output convention so the definitions stay readable in any
terminal.

Detailed documentation lives in [docs/](docs/). To build from a checkout, run the
tests, or open an issue, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Install

The toolkit installs into opencode, globally by default:

```sh
npx opencode-extras
npx opencode-extras --project
npx opencode-extras --global
```

Default is `--copy` per-item (coexistence-safe). Use `--link` for live
symlinks to a local checkout.

## Install Development Mode

For live updates from a local checkout:

```sh
git clone https://github.com/saxix/opencode-extras.git
cd opencode-extras
node ./scripts/install.mjs --global --link
```

Use `--link` to create per-item symlinks that track your working tree.
Use `--project` instead of `--global` to install into `./.opencode`.

## Uninstall

Remove installed items by appending `--uninstall`:

```sh
npx opencode-extras --uninstall
npx opencode-extras --uninstall --global
npx opencode-extras --uninstall --project
```

For a local checkout development install (run from the repository root):

```sh
node ./scripts/install.mjs --uninstall --global
```

Notes:

- The script must be run from the repository root (or via an absolute path);
  otherwise node fails with `Cannot find module './scripts/install.mjs'`.
- If nothing is installed in the target directory the command prints no
  `removed ...` lines and exits 0 -- that means there was nothing to remove.
- `--link` is only an install-time option; uninstall removes both copied and
  linked items, so it can be omitted.

## CLI Help

```text
opencode-extras installer

Usage:
  npx opencode-extras [options]
  npx github:saxix/opencode-extras [options]
  opencode-extras [options]          (via npm bin)

Options:
  --global          Install globally (default unless --project)
  --project         Install in the current project
  --copy            Copy files per-item (default, coexistence-safe)
  --link            Symlink per-item (local dev live, opt-in)
  --prefix <dir>    Override HOME prefix (also env PREFIX)
  --uninstall       Remove installed items
  --dry-run         Show what would be done
  --help, -h        Show this help

Examples:
  npx opencode-extras                              # global (~/.config/opencode)
  npx opencode-extras --project                    # project (.opencode)
  npx opencode-extras --link                       # global live symlinks
  npx --yes github:saxix/opencode-extras --project
  npx opencode-extras --uninstall --global
  npx opencode-extras --dry-run

Notes:
  - Only opencode is supported. The installer writes to
    ~/.config/opencode (global) or ./.opencode (project).
  - There is no target selector: --agent has been removed.
  - Default is --copy per-item (coexistence-safe, no directory symlink conflict).
  - --link creates per-item symlinks: DEST/skills/sax-<name> -> src/skills/<name>.
  - With GitHub specs, --link points to npx's fetched copy/cache, not a local checkout.
  - Never symlinks skills/, agents/, or commands/ themselves (avoids conflict
    with other skill packs); shared spec directories are linked as one unit.
  - Skills are installed with prefix "sax-" to avoid collisions (DEST/skills/sax-<name>).
```
