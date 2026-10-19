# Project Profile (Application / Service)

Generic application or service. This is the full four-guide preset.

## Purpose

Document a deployable application or service where end users, operators, contributors, and deploy owners all need dedicated guidance.

## Required Guides

- **User Guide** -- Overview & Key Features, Getting Started & Onboarding, Feature Workflows, Interface Navigation, FAQs & Troubleshooting.
- **Administrative Guide** -- Configuration Reference, Monitoring & Observability, Maintenance & Operations, Security & Compliance, Troubleshooting.
- **Development Guide** -- Local Environment Setup, Codebase Structure, Git Workflow & Branching, Testing Strategy, CI/CD & Build Pipelines, Contribution Guidelines.
- **Deploy Guide** -- Architecture & Topology, Prerequisites & Infrastructure, Installation, Provisioning & Deployment, Environment Variables, Release & Rollback.
- **Shared sections:** landing page/index, glossary, API reference (if the project exposes one).

## Mandatory Sections

All sub-sections listed above are mandatory. Flag any missing required sub-section as a gap.

## Evidence Sources

- `README*`, `docs/**`, `.pages` nav blocks.
- `docker-compose*.yml`, `.env.example`, `pyproject.toml`, `tox.ini`, `Dockerfile`, deployment manifests.
- API routes, endpoints, schemas, database models.

## Verification Checklist

- Every `docs/**/*.md` is reachable via `.pages` nav or `...` fallback.
- Every `.pages` entry points to an existing file.
- Settings reference and environment variables are in sync with source of truth.
- No orphan pages, no dead anchors, no missing `index.md`.

## Example Structure

```
docs/
  index.md
  user-guide/
    overview.md
    getting-started.md
    ...
  administrative-guide/
    configuration-reference.md
    ...
  development-guide/
    local-setup.md
    ...
  deploy-guide/
    architecture.md
    installation.md
    ...
```
