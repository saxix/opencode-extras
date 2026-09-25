---
name: sax-ticket-writing
description: 'Canonical rules for ticket content shared by the Business Analyst and System Analyst: title, project-prefix ban, draft prefix, body structure, soft-wrap formatting, diagrams, and language resolution. Trigger on "write a ticket", "open a ticket", "ticket title", "ticket body", "draft mode", "create the ticket". Loaded by the Business Analyst and System Analyst.'
---

## Purpose

This is the stateless domain manual for anything that writes or updates ticket content. It is the single source of truth for the rules shared by the `Business Analyst` and the `System Analyst`, which must load this skill instead of re-implementing them. Apply the rules regardless of agent, ticketing provider, or ticket language.

## Title rules

- The title is a separate field and must never be repeated inside the description body.
- The title must never contain a prefix that names the project, product, or namespace (for example `[HDE]`, `[PROJECT]`, `[core]`).
- The only prefix allowed is `[DRAFT] `, and only when the user confirmed draft mode for the ticket being opened.
- Write the title in the resolved ticket language, like the rest of the ticket.

## Body rules

- The description starts with a `## Summary` section and must be self-contained: a reader who sees only the body must understand the ticket without needing the title.
- Structure the body with ATX headings (`##`, `###`), short paragraphs, and lists, in the section order required by the agent.
- Never force new-lines at a fixed column width. Ticket text renders on the web, so write normal flowing paragraphs and lists and leave wrapping to the renderer (soft-wrap).
- Do not force any line-length despite any information you can fine the `AGENTS.md` except if this skill (`ticket-writing`) is explicitly mentioned.
- Use plain ASCII list markers and characters; no emoji, box-drawing glyphs, arrows, or dingbats in ticket content.

## Diagram rules

- Use Mermaid only when the user explicitly asks for a diagram or chart. Otherwise, no diagrams.
- The rendering depends on the configured ticketing provider (see `mcp-ticketing`):
  - **GitHub**: embed a Mermaid fenced code block (`` ```mermaid ``) directly in the ticket body. GitHub renders Mermaid natively.
  - **Azure DevOps**: Mermaid fenced blocks are not rendered natively. Render the Mermaid source to a PNG (mcp-ticketing provides `add_mermaid`, which rasterizes locally and attaches the image), add it as an attachment, and reference it in the body instead of leaving raw Mermaid source.
- When a diagram appears in a ticket, write its labels and notes in the same language as the ticket.

## Language rules

Resolve the ticket language from the project context before asking the user, in this order:

1. Existing ticket: its current language.
2. The language of `README*`.
3. The language of the most recent tickets.
4. The language of `docs/`.

If a single dominant language is found, use it for the whole ticket and record the source. Ask the user only when no default is discoverable from these sources or a material ambiguity exists. Never infer the language from the conversation language or the user's locale. A Mermaid diagram in the ticket must use the same language.

## Worked example

Title field: `Add biographic deduplication with per-program lifecycle`

Description body:

```markdown
## Summary

Add a biographic deduplication workflow that compares records within the same business area and program, keeps a pending/approved lifecycle per dataset, and exposes a token-protected API. HDE orchestrates the flow; a dedicated cluster performs the similarity step.

## Motivation

...

## Acceptance criteria

- Given ... when ... then ...
```

The title carries no project prefix and is not echoed in the body; paragraphs flow without hard wraps and let the renderer wrap on small screens.
