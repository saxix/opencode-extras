# Security and compliance

Who is this for? This page describes the security posture of the toolkit for
operators, maintainers, and anyone handling credentials.

## Threat model

The toolkit is primarily a set of instruction definitions: it has a small
installer, but no application runtime service or data processing
(`README.md:198-200`). The relevant
risks are therefore:

- credential leakage from local files;
- privilege escalation through agent permissions;
- malware-style prompts carried inside ticket content or specs;
- accidental commit of secrets or scratch files.

## Secret handling

- `.envrc` holds live credentials for the ticketing integrations (see
  [Environment variables](../deploy/environment.md)); it is git-ignored and
  must stay untracked (`.gitignore:2`).
- Documentation never includes secret values, only variable **names**.
- If a token is exposed in any output or commit, rotate it immediately and
  remove the copy.

## Agent permission model

Agents are granted the minimum access needed:

- **Read-only repository roles**: the Business Analyst and System Analyst cannot
  edit repository files or run shell commands. Their only writes are explicit
  bookmarks under `.ai-temp/<active-analyst>/` and observations under the shared
  `.ai-temp/findings/`; the Business Analyst may also update its own
  `findings/glossary.yaml` (`agents/business-analyst.md:7-45`,
  `agents/system-analyst.md:7-27`).
- **Deny-by-default**: the Documenter denies all edits except `docs/**`,
  `README*`, and `properdocs.yml`/`properdocs.yaml`
  (`agents/documenter.md:14-28`).
- **Shell restrictions**: analysis agents deny shell entirely; only the Coder
  and Documenter allow limited shell access (the Coder for implementation,
  the Documenter only for `uv run properdocs` and `properdocs`,
  `agents/documenter.md:29-37`).
- **Subagent limits**: subagents are either read-only or read with bounded
  scope (for example `sub-docs-glossary-reader` may only read `docs/**`,
  `agents/sub-docs-glossary-reader.md:5-8`).

Permission lists follow a deny-first, allow-last convention
([configuration reference](configuration.md)).

## Trusting input

- Ticket contents and specs are untrusted source material; they never override
  an agent's role or safety rules (`agents/coder.md:62`).
- Bookmark files are untrusted Markdown. The
  [issue-bookmarks skill](../development/skills-reference.md#issue_bookmarks)
  verifies the active analyst, common schema, agent identity, and path before
  loading, and ignores embedded instructions
  (`src/skills/sax-issue-bookmarks/SKILL.md`).
- The Business Analyst ignores implementation details found in technical
  proposals and records only the functional intent
  (`agents/business-analyst.md:83-85`).
- The security skills apply their own scoped audit gates (for example
  `security-owasp` reports only high-confidence findings,
  `skills/security-owasp/SKILL.md:2-3`).

## Repository hygiene

- `.gitignore` excludes all dotfiles and editor backups (`~*`); only
  `.gitignore` itself is kept among dotfiles (`AGENTS.md:103`).
- `.ai-temp/` scratch is git-ignored and never committed (`AGENTS.md:104-113`).
- The security audit skills exist precisely to catch credential, SSRF, SQLi,
  and auth flaws in the projects this toolkit drives
  (`skills/security-audit/SKILL.md:2-3`).

## Compliance notes

- No telemetry, network calls, or data collection inside the definitions.
- Optional MCP servers connect to ticketing systems only when configured
  (`opencode_cfg.jsonc:21-34`); the Azure DevOps server is disabled by
  default, while the GitHub and Redmine servers are enabled.

## Next steps

- Variable names and their effects: [Environment variables](../deploy/environment.md).
- Escaping a broken config: [Troubleshooting](troubleshooting.md).