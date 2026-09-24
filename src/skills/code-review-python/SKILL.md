---
name: code-review-python
description: Framework, checklist, and idiomatic conventions for reviewing Python code (PEP 8, Type Hints, Modern Python).
---

# Skill: Python Code Review Framework

## Python-Specific Checklist

### 1. Style & Idioms (PEP 8 & Pythonic)
- **Naming:** `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_CASE` for constants.
- **Pythonic Constructs:** Leverage list/dict comprehensions, unpacking, `enumerate`, `zip`, and idiomatic expressions instead of verbose imperative loops.
- **Modern Python:** Promote recent features (e.g., native union operators like `int | None` instead of `Optional[int]` from Python 3.10+).

### 2. Typing & Structure
- Presence of consistent type hints on public function signatures.
- Proper use of descriptive docstrings (Google or Sphinx style).

### 3. Error & Resource Management
- Avoid bare `except:` blocks; catch specific exceptions and use exception chaining (`raise ... from err`).
- Use context managers (`with` statements) for safe handling of files, sockets, or transactions.

## Required Output Format
When reviewing Python code, structure your output as follows:
1. **General Evaluation:** Summary judgment on code quality (e.g., Excellent, Good, Needs Improvement).
2. **Identified Issues (Prioritized):** Security > Correctness/Logic > Performance > Style/PEP 8.
3. **Refactoring Proposal:** Clean, production-ready Python code block.
