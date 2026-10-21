---
name: sax-security
description: 'Orchestrated security audit using `sax-security-audit` (threat modeling) and `sax-security-owasp` (OWASP confidence). Use for "audit the code", "find vulnerabilities", "security review".'
---

## Methodology

When asked for a security audit, load both skills and merge their outputs:

1. **Load `sax-security-audit`** -- run the Principal Security Auditor threat modeling pass (attack surfaces, secrets, injection, SSRF, open endpoints)
2. **Load `sax-security-owasp`** -- run the OWASP high-confidence pass (trace data flow, verify exploitability, apply confidence levels)
3. **De-duplicate findings** -- if both flag the same issue, keep the more detailed version with higher severity
4. **Report** using the `sax-security-audit` format (Vulnerability Type, Severity, Location, Remediation) with confidence levels from `sax-security-owasp`
