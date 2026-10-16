---
name: sax-create-redmine-issue
description: Creates a new Redmine issue or ticket for bugs, enhancements, or tasks using the Redmine MCP server (mcp-ticketing). Use this when asked to "open a Redmine ticket", "file a Redmine issue", "create a Redmine task", or report bugs/features to Redmine.
---

## Objective
Create a structured, well-formatted Redmine issue in the project configured for the
Redmine MCP server, directly from the workspace.

---

## Prerequisites & Verification

1. Verify the Redmine MCP server is configured and running. It must be declared in
   the opencode MCP configuration as:

   ```json
   "redmine": {
     "type": "local",
     "command": ["uv", "run", "mcp-ticketing", "redmine"],
     "cwd": "{env:MCP_TICKETING_HOME}",
     "enabled": true
   }
   ```

2. Verify the Redmine credentials are available in the environment (`.envrc` or the
   server `environment` block): `MCP_REDMINE_URL`, `MCP_REDMINE_PROJECT`,
   `MCP_REDMINE_API_KEY`.
3. If the server is missing, disabled, or the credentials are unset, stop and report
   the error to the user. Never ask for the API key in chat; it must be configured
   outside the conversation.

---

## Workflow Steps

### Step 1: Verify the connection and discover the project's vocabulary

Call the MCP tools, in order:

- `get_ticket_types` -- collect the valid Redmine issue types (e.g. Bug, Feature, Task).
- `get_iterations` -- collect the project versions (milestones) when a version is needed.

Use the results to pick a valid `ticket_type` (and `iteration_path` if requested). If the
user did not specify a type, ask them or use the instance default.

### Step 2: Gather & Validate Information

Collect and structure the issue metadata before execution:

- **Title**: short, imperative summary (e.g. `fix(api): handle connection timeout in worker pool`).
- **Description**: detailed Markdown content including:
  - `## Summary` -- self-contained context (the title must not be repeated in the body)
  - Motivation / Context
  - Proposed changes / Steps to reproduce
  - Acceptance criteria / Tasks checklist
- **Ticket type**: one of the issue types returned by `get_ticket_types`.
- **Assignee** (optional): Redmine user login or full name.
- **Priority** (optional): 1-4 (1 = Urgent, 2 = High, 3 = Normal, 4 = Low).
- **Version** (optional): version name from `get_iterations`.

Follow the `sax-ticket-writing` skill conventions for title and body structure when
available (no project prefix in the title, `## Summary` first, soft-wrap, ASCII
markers). The Redmine backend converts Markdown to HTML automatically.

### Step 3: Create the ticket

Call `create_ticket` with the collected fields:

```
create_ticket(
  ticket_type="Bug",
  title="Handle connection timeout in worker pool",
  description="## Summary\n\n...",
  assigned_to="mario",        # optional
  priority=2,                 # optional
  iteration_path="v1.2"       # optional
)
```

Notes on Redmine-specific fields:

- `tags` and `area_path` are not supported by Redmine; do not pass them.
- The `state` of the created issue is the issue type's default; do not pass a state.

### Step 4: Execute & Output Result

- Capture the response. On success it contains `success`, `id`, `title`, `url`,
  `message`.
- Verify the ticket was created by calling `get_ticket` with the returned `id` and
  checking the subject matches.
- Return the link and issue number clearly to the user (e.g. `https://redmine.example.com/issues/123`).
- On error, report the `error` message verbatim and stop. Do not retry blindly: an
  ambiguous failure may have created the ticket, so call `search_tickets` on the title
  first to avoid duplicates.

### Step 5 (optional): Add a diagram

If the user asks for a diagram, use Mermaid and call `add_mermaid` with the created
ticket id. Redmine renders HTML descriptions but not Mermaid natively, so the MCP
server renders the diagram to a high-resolution PNG, attaches it to the issue, and
embeds an `<img>` tag in the description.

---

## Error handling

- Missing `MCP_REDMINE_URL` / `MCP_REDMINE_PROJECT` / `MCP_REDMINE_API_KEY`: tell the
  user to set them in the server `environment` block or in `.envrc` and restart the TUI.
- `get_ticket_types` returns an error: report it; the server is probably unreachable
  or the API key is wrong.
- A non-2xx response is reported by the MCP server as `{"error": "HTTP ..."}`; surface
  the HTTP status to the user without dumping full response bodies that may contain
  sensitive data.