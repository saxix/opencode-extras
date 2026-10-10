# opencode-extras

Reusable **agents**, **skills**, and **commands** for AI coding TUIs. Typeset as plain Markdown with a portable output convention so they render across `opencode`, Claude Code, Codex, pi, Gemini CLI, hermes, and other terminal assistants.

Detailed documentation lives in [docs/](docs/).

## Install

The default target is `opencode`, installed globally:

```sh
npx opencode-extras
npx opencode-extras --project
npx opencode-extras --agent claude --global
npx opencode-extras --agent codex --project
npx opencode-extras --agent pi --global
npx opencode-extras --agent compat
```

`--agent compat` selects the project `.agents` layout and implies `--project`.
Default is `--copy` per-item (coexistence-safe). Use `--agent` with one target per invocation.

## Install Development Mode

For live updates from a local checkout:

```sh
git clone https://github.com/saxix/opencode-extras.git
cd opencode-extras
node ./scripts/install.mjs --global --link --agent opencode
```

Use `--link` to create per-item symlinks that track your working tree.
Run the same command with different `--agent` or `--project` flags to install for other targets.

## Uninstall

Remove installed items by appending `--uninstall`:

```sh
npx opencode-extras --uninstall
npx opencode-extras --uninstall --agent opencode --global
npx opencode-extras --uninstall --project --agent opencode
npx opencode-extras --uninstall --agent compat
```

For a local checkout development install:

```sh
node ./scripts/install.mjs --uninstall --global --link --agent opencode
```

## CLI Help

```text
opencode-extras installer

Usage:
  npx opencode-extras [options]
  npx github:saxix/opencode-extras [options]
  opencode-extras [options]          (via npm bin)

Options:
  --agent <target>  Select one target: opencode (default), compat, claude, codex, pi
  --global          Install globally (default unless --project)
  --project         Install in the current project
  --copy            Copy files per-item (default, coexistence-safe)
  --link            Symlink per-item (local dev live, opt-in)
  --prefix <dir>    Override HOME prefix (also env PREFIX)
  --uninstall       Remove installed items
  --dry-run         Show what would be done
  --help, -h        Show this help

Examples:
  npx opencode-extras                              # opencode global (default)
  npx opencode-extras --project                    # opencode project
  npx opencode-extras --agent claude --global      # claude global
  npx opencode-extras --agent codex --project      # codex project
  npx opencode-extras --agent pi --global          # pi global
  npx opencode-extras --agent compat               # project .agents layout
  npx opencode-extras --agent opencode --link      # global live symlinks
  npx --yes github:saxix/opencode-extras --project --agent opencode
  npx opencode-extras --uninstall --agent opencode --global
  npx opencode-extras --dry-run --agent claude --global

Notes:
  - --agent accepts one target per invocation and defaults to opencode.
  - --agent compat uses ./.agents and implies --project; it cannot use --global.
  - Default is --copy per-item (coexistence-safe, no directory symlink conflict).
  - --link creates per-item symlinks: DEST/skills/sax-<name> -> src/skills/<name>.
  - With GitHub specs, --link points to npx's fetched copy/cache, not a local checkout.
  - Never symlinks skills/, agents/, or commands/ themselves (avoids conflict
    with other skill packs); shared spec directories are linked as one unit.
  - Skills are installed with prefix "sax-" to avoid collisions (DEST/skills/sax-<name>).
```
