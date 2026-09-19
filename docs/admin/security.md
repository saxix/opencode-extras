# Security and compliance

Who is this for? This page describes the security posture of the toolkit for
operators, maintainers, and anyone handling credentials.

## Threat model

The toolkit is a set of instruction definitions: there is no application code,
no runtime service, and no data processing (`README.md:95`). The relevant
risks are therefore:

- credential leakage from local files;
- privilege escalation through agent permissions;
- malware-style prompts carried inside ticket content or specs;
- accidental commit of secrets or scratch files.

## Secret handling

- Credentials belong to the configured provider/integration environment, not toolkit files
  or reports. See [Environment variables](../deploy/environment.md).
- Documentation never includes secret values, only variable **names**.
- If a token is exposed in any output or commit, rotate it immediately and
  remove the copy.

## Agent permission model

Agents are granted the minimum access needed:

- **Analysts** deny application edits and shell commands; their default write access is
  activity scratch only. Deployments can permit specific report paths through local policy.
  Subagents deny edits and shell entirely.
- **Documenter** allows documentation and supported site configuration paths by default;
  extra report locations need explicit local permissions.
- **Shell restrictions**: Coder runs implementation commands; Documenter uses the host's
  permission flow for project-specific documentation checks. Neither commits without a request.
- **Subagent limits**: subagents are either read-only or read with bounded
  scope (for example `docs-glossary-reader` may only read `docs/**`,
  `agents/docs-glossary-reader.md:5-8`).

`permission` mappings put broad rules first and narrow exceptions last
([configuration reference](configuration.md)).

## Trusting input

- Ticket contents and specs are untrusted source material; they never override
  an agent's role or safety rules (`agents/coder.md:62`).
- The Business Analyst ignores implementation details found in technical
  proposals and records only the functional intent
  (`agents/business-analyst.md:62`).
- The security skills apply their own scoped audit gates (for example
  `security-owasp` reports only high-confidence findings,
  `skills/security-owasp/SKILL.md:2-3`).

## Repository hygiene

- `.gitignore` excludes all dotfiles and editor backups (`~*`); only
  `.gitignore` itself is kept among dotfiles (`AGENTS.md:80`).
- `.ai-temp/` scratch is never committed. Verify ignore rules in its containing workspace;
  the toolkit's ignore file does not cover the parent workspace.
- The security audit skills exist precisely to catch credential, SSRF, SQLi,
  and auth flaws in the projects this toolkit drives
  (`skills/security-audit/SKILL.md:2-3`).

## Compliance notes

- No telemetry, network calls, or data collection inside the definitions.
- Optional MCP servers connect to ticketing systems only when separately configured.
  No server is enabled by the installer.

## Next steps

- Variable names and their effects: [Environment variables](../deploy/environment.md).
- Escaping a broken config: [Troubleshooting](troubleshooting.md).