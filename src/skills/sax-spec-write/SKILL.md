---
name: sax-spec-write
description: Interactively analyzes and refines specification/requirement files in a loop. Files without an absolute path are resolved inside the '.specs/' folder at the project root. Use this when "expand spec", "write spec", "analyse spec"
---

## Objective
Iteratively refine, complete, and update software feature specifications through a continuous read-analyse-ask-update loop until zero ambiguities, gaps, or contradictions remain.

---

## Path Resolution Rules

- **Absolute Path**: If an absolute path is provided (e.g., `/Users/.../file.md` or `/project/specs/file.md`), access the file directly at that location.
- **Relative Path / File Name / Spec Number**": If no absolute path is provided, the target file **must** be resolved inside the `.specs/` folder at the project root
    - `<file>` -> `.specs/<file>`
    - `<NUMBER>` -> search for `.specs/<NUMBER>*` (files starting with that number, e.g.003_pg_pp.md)
- Search must stop at first match
---

## Interactive Workflow Loop

Follow this loop continuously for each turn of the conversation:

```text
[1. Read & Resolve] --> [2. Analyze] --> [3. Ask & Options] --> [4. Update File]
  ^                                                                      |
  +------- Repeat Loop: re-run from Step 1 until no open points ---------+
(Until no open points remain)
```

### Step 1: Read & Resolve
1. Resolve the file location using the **Path Resolution Rules**.
2. Read the specification file using the `Read` tool.
3. If the file does not exist, ask the user whether to create a new spec inside `$PWD/.specs/`.

### Step 2: Analyze & Cross-Check
Analyze the spec against the codebase and quality standards:
1. **Scope & Clarity**: Identify vague terms, missing error paths, undefined edge cases, or unclear business scope (new vs. update).
2. **Codebase Collision**: Use `Read` and `Bash` to search the codebase and check if the proposed spec conflicts with existing code, APIs, or database models.
3. **Completeness Gates**: Check for missing acceptance/testing criteria, documentation updates, breaking changes, or integration risks.
4. **Consistency**: Ensure internal sections do not contradict each other.

### Step 3: Ask & Propose Solutions
If any ambiguities, gaps, or contradictions are found:
- Present the findings clearly to the user.
- For each point, propose **at least two concrete, reasonable solutions**.
- Explicitly allow the user to suggest an alternative solution.
- **Stop and wait for the user's response** before making assumptions.

### Step 4: Update File
- Once the user answers, apply the agreed changes immediately to the spec file in its resolved location (`.specs/`).
- Format the file strictly according to the **Output Template** below.

### Step 5: Evaluate Loop
- **If new ambiguities, missing details, or open questions emerged** after updating: **Restart from Step 1**.
- **If NO open points, ambiguities, or contradictions remain**: Inform the user that the specification is fully finalized and ready for implementation.

---

## Output Template

Every specification file in `.specs/` must strictly follow this Markdown structure:

```markdown
# [SPEC-ID/TITLE]

## Description
A concise overview of the feature or change written in clear business-user language.

## Motivation
Why this feature needs to be implemented and its impact on the business/system (problem solved, new capabilities).

## Application Area & Impacted Components
Specific modules, UI components, APIs, or architectural layers affected by this change.

## Requirements & User Flows
Detailed functional requirements, step-by-step user flows, edge cases, and error handling paths.

## Breaking Changes
Explicit list of changes that break existing app behavior, data models, or public APIs.

## Integration Changes
Dependencies on or changes required in external systems, third-party APIs, or sub-systems.

## Testing & Acceptance Criteria
Concrete verification steps, test scenarios (unit, integration, e2e), and acceptance criteria.

## Documentation Updates
List of documentation artifacts requiring updates (API docs, user guides, system architecture).
```
