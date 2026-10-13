---
name: sax-create-gitlab-issue
description: Create GitLab issues through REST APIs using existing Git credentials, without requiring glab. Use when asked to create a GitLab issue, open a GitLab ticket, or "creare una issue su GitLab".
---

# Create a GitLab issue

## Scope

Create and publish an issue when explicitly requested by the user.
A request to prepare a draft does not authorize publication.
Follow applicable repository instructions and session permissions.
Use the ticket-writing skill, if available, for content conventions.

## Identify the project and prepare content

1. Identify the target repository from the request or current context.
   Ask if ambiguous. Read applicable AGENTS.md files.
   Execute Git and Python commands in that repository.
2. Determine the GitLab instance and complete project path from the selected
   Git remote (normally `git remote get-url origin`). Support HTTPS, SSH and
   SCP-style remotes, including nested groups. Remove only the final `.git`
   suffix. Capture remote output rather than printing embedded credentials.
   An SSH transport port is not an HTTPS API port. For ambiguous self-hosted
   base URLs or URL prefixes, ask for the correct GitLab base URL.
3. Gather a concise title and Markdown description from the user's request.
   Include context, requested work and acceptance criteria; include available
   reproduction steps for bugs. Use the user's language and do not invent
   requirements. Resolve labels, assignees or milestones only when requested.
4. Use Python with `requests` in an available environment. Check availability;
   do not silently install dependencies or change the project's environment.
   Pass issue content through UTF-8 stdin or a temporary JSON file created
   with permitted file tools. Do not interpolate user content into shell code.
   On Windows PowerShell 5.1, ensure UTF-8 pipeline encoding when using stdin.

## Authenticate without exposing credentials

Prefer an existing token in `GITLAB_TOKEN` or `GLAB_TOKEN` intended for the
selected instance. Otherwise retrieve the credential from Git's configured
helper, capturing its output in memory:

```python
import os
import subprocess

# credential_host includes the HTTPS port only if the API uses a nondefault port.
result = subprocess.run(
    ["git", "credential", "fill"],
    input=(
        f"protocol=https\nhost={credential_host}\n"
        f"path={project_path}.git\n\n"
    ),
    text=True,
    capture_output=True,
    env=dict(os.environ, GIT_TERMINAL_PROMPT="0", GCM_INTERACTIVE="never"),
    timeout=15,
    check=False,
)
credentials = dict(
    line.split("=", 1)
    for line in result.stdout.splitlines()
    if "=" in line
)
token = credentials.get("password") if result.returncode == 0 else None
```

Never print or persist tokens, credential helper output, authentication headers
or credential-bearing remote URLs. Keep credentials only in memory.
A stored Git password is not necessarily an API token: validate API access.
If authentication fails, ask the user to configure credentials outside the
conversation; do not ask them to paste a token into chat.

Use `PRIVATE-TOKEN` for personal, project or group access tokens.
Use `Authorization: Bearer ...` for a known OAuth access token, including an
OAuth credential returned by the helper. Do not assume every helper credential
is a personal access token. If a read-only request rejects an uncertain header
type, check the credential type or try the other supported header on that GET.
Do not send both authentication headers together.

Use HTTPS, keep TLS verification enabled and disable redirects on authenticated
requests. Report redirects for base URL correction rather than forwarding the
credential to an unverified destination.

## Resolve the project

URL-encode the complete namespace/project path:

```python
from urllib.parse import quote

encoded_path = quote(project_path, safe="")
```

Call the following endpoint with the selected authentication header,
`timeout=30` and `allow_redirects=False`:

```text
GET {base_url}/api/v4/projects/{encoded_path}
```

Require HTTP 200 and retain the response's numeric project ID. Check that the
returned project path matches the intended repository. Never reuse a project
ID or hostname from another session. Handle authentication failures, missing
projects and insufficient access before attempting publication.

## Publish and verify

Send one authenticated POST using the resolved project ID:

```python
import requests

response = requests.post(
    f"{base_url}/api/v4/projects/{project_id}/issues",
    headers=auth_headers,
    json={"title": title, "description": description},
    timeout=30,
    allow_redirects=False,
)
```

Require HTTP 201 and retrieve `iid` and `web_url` from the response.
Read the issue back with an authenticated GET:

```text
GET {base_url}/api/v4/projects/{project_id}/issues/{iid}
```

Use the same timeout and redirect settings. Verify its title and description.
Distinguish a verification failure from successful creation: once POST succeeds,
do not create a second issue merely because the verification GET failed.

After an ambiguous timeout or network failure, do not blindly repeat the POST:
check recent issues for matching title and description to avoid duplicates.
Ask the user if the result remains uncertain.

Report failures using HTTP status and sanitized details. Do not dump full
responses, request headers or exceptions that might expose credentials.

## Optional attachments and comments

Attachments and comments require a user request and separate verification.
Use `POST /api/v4/projects/{project_id}/uploads` for requested attachments.
Include the returned Markdown link in the description or a requested note.
Use `POST /api/v4/projects/{project_id}/issues/{iid}/notes` for comments.
Capture and verify each write independently; do not retry ambiguous writes
without checking whether they succeeded.

## Final response

Return the created issue's number, title and URL. Claim success only when
supported by the API response and state any verification failure explicitly.
Do not modify application code or create commits as part of issue creation.
