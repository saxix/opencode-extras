---
name: django-models
description: Design Django ORM models using the target repository's supported Django version, database, base classes, and model conventions. Use when adding or refactoring Django models, fields, relationships, constraints, or indexes.
---

# Django model design

## Establish project context

1. Identify the target repository and read its applicable `AGENTS.md`, project configuration,
   existing models, and migrations. In a multi-repo workspace, inspect shared model libraries
   only as needed and do not modify them without an authorized cross-repo scope.
2. Determine supported Django versions and database backends. A dependency lower bound is
   not the installed version; inspect the lockfile or resolved project environment when available.
3. Follow existing app layout, base classes, naming, primary key type, translation style,
   timestamps, and deletion policy. Do not invent organization-specific classes or import them without
   repository evidence. Sentry SDK usage does not imply access to Sentry's internal ORM classes.

## Model rules

- Use existing shared base models only when the repository actually depends on them;
  otherwise use `models.Model`. Custom bounded fields and soft-delete machinery are not
  standard Django features and must not be introduced by assumption.
- Choose field types, lengths, nullability, and defaults from business requirements and
  existing data. Use callable defaults such as `dict` and `list` for mutable values.
- On Django 4.2, use `default` when a Python-side default is required. `db_default` requires
  Django 5.0+ and has different semantics; it is not a universal substitute for `default`.
- Specify `on_delete` for every `ForeignKey` / `OneToOneField`. Choose the behavior from
  lifecycle requirements, not from a generic scaffold. Match existing `related_name` conventions.
- Use `models.JSONField` only where supported by the project's database and usage requirements.
- Prefer explicit, descriptive constraints for new rules where supported. Validate backend
  support for conditional or expression constraints; nullable uniqueness is backend-dependent.
- Design indexes from actual query predicates, ordering, and query plans. Do not assume that
  the most selective column must always come first or that every foreign key needs another index.
- Follow local requirements for `verbose_name`, `help_text`, and translated labels. When labels
  are translated at import time, use `gettext_lazy` unless the project's context requires otherwise.
- Describe non-obvious model semantics in a docstring. A descriptive docstring is not a doctest.

## Finish

1. Make models discoverable through the existing `models.py` or `models/__init__.py` layout.
   Do not import models from the app package's top-level `__init__.py` merely to register them.
2. Load `django-migration` to generate and review migrations using the actual project runner.
3. Run targeted checks and business-logic tests with the project's environment and backend.
   Verify compatibility in dependent repositories when the authorized change alters shared models.
