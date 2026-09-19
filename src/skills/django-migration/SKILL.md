---
name: django-migration
description: Generate and review Django database migrations with the target project's supported Django version, database, environment, and deployment conventions. Use for schema changes, data migrations, indexes, and migration conflicts.
---

# Django migrations

## Resolve the environment first

- Read workspace and repository instructions, existing migrations, and project configuration.
- Identify the target app, supported and installed Django versions, database backend, settings,
  and the existing runner. Do not assume PostgreSQL, tox, uv, direnv, or pytest-django.
- Set the command working directory to the repository containing the relevant management entry
  point. Use its Python environment; never run migrations from the multi-repo workspace root.
- Resolve whether the configured database is local development before applying migrations.
  Generating migrations does not by itself authorize changing a remote or production database.

## Generate and inspect

The following arguments are examples to pass through the project's resolved runner. A project
may use `pdm run python`, `uv run python`, its venv interpreter, Docker, or a documented script.

```text
python manage.py makemigrations <app_name>
python manage.py makemigrations <app_name> --empty
python manage.py sqlmigrate <app_name> <migration_name>
python manage.py migrate --plan
```

- Use `--empty` only for a deliberate data/custom migration. Prefer generated schema operations.
- Review dependencies, operation order, defaults, constraints, indexes, and backend compatibility.
- Use `sqlmigrate` for SQL-bearing migrations where the backend supports it. It does not validate
  Python data migrations; inspect and test their behavior separately.
- Register new models through the established `models.py` / `models/__init__.py` layout,
  not by importing models in the app package's top-level `__init__.py`.

## Version-aware schema changes

- Django 4.2 does not support `db_default`. Use a Python-side `default` only when required by
  the domain; choose a one-off migration default or staged backfill for existing rows.
- Django 5.0+ supports `db_default`, but database and Python defaults serve different purposes.
  Introduce it only when compatible with all supported versions and the chosen backend.
- Adding a non-null field to populated tables may require nullable addition, a backfill, then
  a constraint. Assess table size, locks, existing data, and deployment order.
- Use standard operations such as `RemoveField` unless a custom operation is verified in the
  repository. `SafeRemoveField` and `DeletionAction` are not Django built-ins.
- For deletion or renaming, follow the project's rollout policy. Standard rename operations
  are valid tools; use `db_column` / `db_table` to preserve physical names when that is intentional.
- For data migrations use historical models via `apps.get_model`, the migration database alias,
  and an appropriate reverse operation or an explicit explanation of irreversibility.
- Do not rewrite migrations already applied/shared without an explicit coordinated strategy.

## Verify

1. Run the project's migration consistency check (for example `makemigrations --check --dry-run`).
2. Apply to the confirmed local/test database when within the requested scope.
3. Run targeted tests for changed business behavior, data transformations, and upgrade paths.
   Use pytest-django flags such as `--reuse-db` only if the project uses that plugin and they are
   not already configured. Do not add tests that merely restate standard ORM behavior.
4. Report the actual commands, working directories, database context, outcomes, and checks not run.
   For cross-repo changes, record deployment order and compatibility expectations for consumers.
