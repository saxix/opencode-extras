# Library Profile

Python library, SDK, or reusable package.

## Purpose

Document a library consumed as a dependency. Optimize for installation, import, and contribution.

## Required Guides

- **User Guide** — Overview & Key Features, Getting Started & Onboarding, Feature Workflows, Interface Navigation, FAQs & Troubleshooting.
- **Development Guide** — Local Environment Setup, Codebase Structure, Git Workflow & Branching, Testing Strategy, CI/CD & Build Pipelines, Contribution Guidelines, API Reference (one page per public module), CLI Reference (if the library exposes a CLI).
- **Excluded by default:** Administrative Guide, Deploy Guide (add only if the library has runtime config or a deployment story). Shared sections: index, glossary.

## Mandatory Sections

- **Installation** — prerequisites (OS, Python/Node version), methods (`pip`/`pipx`/`uv tool`/`poetry` only if configured in `pyproject.toml`/`package.json`), verification (`python -c "import <pkg>" --version`), upgrade/uninstall, troubleshooting. Every command executable.
- **API Reference** — one page per public module with purpose, key symbols, and usage snippet. Source of truth: docstrings, type hints, `__all__`.
- **Development** — local setup, test strategy, how to add a new public API, release process.

Flag any missing Installation or API Reference page as High gap.

## Evidence Sources

- `pyproject.toml` `[project]`, `[project.dependencies]`, `[project.scripts]`, `README*`.
- `src/<pkg>/**/*.py` docstrings and type hints.
- `tox.ini`, `tests/`, `.pages` under `docs/`.

## Verification Checklist

- Every public module has an API page and the page matches docstrings.
- Every install command is runnable and matches `pyproject.toml`.
- No Administrative/Deploy pages flagged as missing when the preset excluded them.

## Example Structure

```
docs/
  index.md
  user-guide/
    getting-started.md
    installation.md
  development-guide/
    local-setup.md
    api-reference/
      mylib.core.md
```
