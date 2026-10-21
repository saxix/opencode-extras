# Conventions

Who is this for? Contributors adding or changing definitions. These rules are
normative: `AGENTS.md` is the canonical source, and this page summarizes it for
the documentation site.

## Repository shape

| Path | Contract |
|---|---|
| `src/agents/*.md` | One agent per file; `description:` frontmatter is required, `mode:` is `primary` or `subagent` |
| `src/skills/<name>/SKILL.md` | One skill per directory; `name:` and `description:` are required |
| `src/commands/*.md` | One command per file; `description:` is required, `agent:` is optional |
| `src/plugins/` | Reserved for opencode plugins; **never** installed by the installer |

Any other top-level directory under `src/` is not a definition kind opencode
can load: the installer warns about it instead of installing it. Put shared
reference material in a skill (`src/skills/<name>/`) and load that skill by
name.

Skill directories are installed with the `sax-` prefix
(`DEST/skills/sax-<name>/`) to avoid collisions with other skill packs. Editor
backups (`~name`) and dotfiles under `src/` are ignored: they are never part of
the definitions.

## Naming

- Skill directory names are kebab-case (`sax-architecture-review`), with
  underscores tolerated (`sax-create_github_issue`).
- Agent files are kebab-case Markdown files (`business-analyst.md`).
- Command files are kebab-case Markdown files (`devils-advocate.md`).
- The `description:` field carries the literal trigger keywords users are
  likely to say; it is what makes a skill or agent discoverable.

## TUI-portable output

Every definition must produce output that renders correctly in opencode and
stays plain enough for any Markdown renderer. The rules:

- Plain CommonMark only: no raw HTML, no custom containers or admonitions.
- ASCII-first: no emoji, box-drawing glyphs, arrows, or dingbats. Use `--`
  rather than the em-dash character and `->` rather than an arrow character.
- ATX headings (`##`, `###`), not setext headings.
- Narrow tables and short bullets so lines stay under about 100 characters.
- Fenced code blocks with a language tag; no indented code blocks.
- Self-contained evidence inline as `path/to/file:line`, not as relative links
  the reader may not have open.
- No TUI-specific directives (tool-call syntax, slash-command references, keybind
  hints).

Diagrams, when explicitly requested, use Mermaid fenced code blocks and the
same language as the surrounding document.

## Agent permissions and state

Agents declare a deny-by-default permission surface in frontmatter. Only the
Business Analyst and System Analyst persist state, and only on an explicit user
request, through the `sax-issue-bookmarks` skill; the layout is owned by the
`sax-state-persistence` skill. The scratch area is `.ai-temp/` (git-ignored).

## Documentation contract

- User-facing behavior belongs in `docs/user-guide/`.
- Catalogs belong in `docs/reference/` and are generated; never edit them by
  hand.
- Contributor rules belong in `docs/maintainers/`.
- `docs/index.md` links only to pages that exist; `properdocs build --strict`
  and the docs tests enforce this.
