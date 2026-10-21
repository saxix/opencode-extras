# Releasing

Who is this for? Maintainers publishing a new version of the toolkit.

## Before you tag

1. Run the full suite and the docs checks:
   ```sh
   npm test
   node scripts/gen-references.mjs --check
   properdocs build --strict
   ```
2. Confirm the generated catalogs and the tables in `AGENTS.md` match `src/`.
3. Check that `docs/index.md` counts still match the sources.

## Versioning

`package.json` is the single source of the published version. Use semantic
versioning for the installed surface:

| Change | Bump |
|---|---|
| New agent, skill, command, or install option | minor |
| Fix to an existing definition without behavior change | patch |
| Removed or renamed skill, installer flag, or install path | major |

Because skills are installed as `DEST/skills/sax-<name>/`, renaming a skill
directory breaks existing installs until they re-run the installer: treat it as
a breaking change.

## Publish

```sh
npm version minor          # updates package.json and creates the tag
npm publish                # package name: @saxix/opencode-extras
git push --follow-tags
```

The published package ships `src/`, `scripts/`, `README.md`, and `AGENTS.md`
(`files` field); tests and docs are not included. The only binary is
`opencode-extras`, which resolves to `scripts/install.mjs`.

## After publishing

- Create a GitHub release from the tag, summarizing user-visible changes.
- Verify the deployed documentation (GitHub Pages) reflects the new tag.
- Optionally smoke-test the published package:
  ```sh
  npx --yes @saxix/opencode-extras --dry-run
  ```
