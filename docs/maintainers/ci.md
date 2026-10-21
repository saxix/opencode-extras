# CI

Who is this for? Maintainers who need to know what runs on every push or pull
request, and how to reproduce a CI failure locally.

## Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| `.github/workflows/tests.yml` | push to `main`, pull request, manual | Runs `npm test` on Node 18, 20, and 22 |
| `.github/workflows/docs.yml` | push to `main`, manual | Builds the site with `properdocs build --strict` and deploys it to GitHub Pages |

Both workflows request only `contents: read`. The docs workflow additionally
needs `pages: write` and `id-token: write` for the Pages deployment and runs
with a `pages` concurrency group; the tests workflow cancels superseded runs on
the same ref.

## Tests workflow

The matrix covers the declared floor (`engines.node >= 18`) plus the active LTS
lines, with `fail-fast: false` so one Node version does not hide failures on
another. There is no install step: the repository has no dependencies.

## Docs workflow

`properdocs build --strict` turns documentation warnings into errors, so a
broken relative link or a missing nav target fails CI instead of appearing as a
warning in the build log. The generated reference pages are part of the
repository, so staleness is caught by the test suite rather than by the docs
build.

## Reproducing locally

```sh
npm test                          # same command as the tests workflow
node scripts/gen-references.mjs --check
pip install properdocs properdocs-theme-mkdocs pymdown-extensions
properdocs build --strict
```

The reference check fails with `stale: docs/reference/<page>.md` when a source
definition changed without regenerating the catalogs. Fix it with
`node scripts/gen-references.mjs`.

## Link checking

`tests/docs-links.test.mjs` walks every Markdown file under `docs/` and
resolves each relative link against the filesystem. External URLs
(`http`, `https`, `mailto`) and pure anchors are skipped. The test complements
`--strict`: it fails fast with the offending file and target, and it also
catches links to non-Markdown assets.
