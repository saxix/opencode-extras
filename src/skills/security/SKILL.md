---
name: security
description: Orchestrated security audit using security-audit (threat modeling) and security-owasp (OWASP confidence). Use for "audit the code", "find vulnerabilities", "security review".
---

## Methodology

When asked for a security audit, load both skills and merge their outputs:

1. **Load `security-audit`** -- run the Principal Security Auditor threat modeling pass (attack surfaces, secrets, injection, SSRF, open endpoints)
2. **Load `security-owasp`** -- run the OWASP high-confidence pass (trace data flow, verify exploitability, apply confidence levels)
3. **De-duplicate findings** -- if both flag the same issue, keep the more detailed version with higher severity
4. **Report** using the `security-audit` format (Vulnerability Type, Severity, Location, Remediation) with confidence levels from `security-owasp`
