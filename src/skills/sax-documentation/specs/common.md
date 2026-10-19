# Common Profile

Shared rules for all documenter profiles. Every type-specific profile inherits this file.

## Language

- Derive the documentation language from the project default (`README*` / `docs/` language); fall back to English when no default is discoverable.
- All generated pages use the same language; record the source of the language decision.

## Evidence

- Every technical detail must trace to repository evidence. Record the source (`path:line`-style reference or file path) rather than asserting unverified behavior.
- Never invent settings, flags, fields, endpoints, defaults, or examples that are not in the project.
- If the project already documents a fact differently across pages, flag the conflict and ask how to resolve it rather than silently choosing one version.

## Style

- Plain CommonMark, ASCII-first, ATX headings (`##`, `###`), no emojis, no raw HTML.
- Purpose-first opening ("Who is this for?"), action-oriented headings, numbered imperative steps naming UI elements, active voice / second person.
- First-use glossary links, acronym expansion, TL;DR on long pages, one job per page.
- Syntax-highlighted code blocks (```bash, ```yaml, ```python) with valid fences/front matter/relative links.

## Verification Base

- Structure and coverage against the taxonomy for the selected guides only (missing pages, orphan pages, misplaced topics).
- Internal navigation and links (build result, dead anchors, dead `.pages` entries) for the selected scope.
- Content consistency: entity names, defaults, and endpoints cross-checked against source.
- Style compliance for pages you wrote or edited.
- Build tool result, when one runs (report which tool and whether it succeeded).

## Resilience

- Input validation: `repo root` max 500 chars, `scope` is one of the preset guides; return `VALIDATION_ERROR` with field and limit.
- Retry with backoff for shell/build calls (`max_retries: 2, initial_delay: 1s, backoff_multiplier: 2, max_delay: 10s`); retryable `TIMEOUT`/`5xx`/`CONNECTION_ERROR`, non-retryable `VALIDATION_ERROR`/`404`.
- Fallback: when `properdocs build` retries are exhausted, fall back to static Markdown checklist checks and report `Build unavailable -- static checks only`.
- Circuit breaker: 3 consecutive failures for `properdocs --version` or `build` -> OPEN 60s, skip build and use static checks.
- Timeout: `properdocs --version`: 30s; `properdocs build`: 60s; edit `docs/**`: 30s.
