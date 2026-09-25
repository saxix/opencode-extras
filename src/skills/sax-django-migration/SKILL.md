---
name: sax-django-migration
description: Generate Django database migrations. Use when creating migrations, adding/removing columns or tables, adding indexes, or resolving migration conflicts.
---

# Generate Django Database Migrations

## Commands

Generate migrations automatically based on model changes:

```bash
python manage.py makemigrations
```

For a specific app:

```bash
python manage.py makemigrations <app_name>
```

Generate an empty migration (for data migrations or custom work):

```bash
python manage.py makemigrations <app_name> --empty
```

## After Generating

1. If you added a new model, ensure it's imported in the app's `__init__.py`
2. Review the generated migration for correctness
3. lint the migration code
3. Run `python manage.py sqlmigrate <app_name> <migration_name>` to verify the SQL
4. Apply the migration locally with `python manage.py migrate <app_name>` 



### Don't test the ORM

Don't write tests that only exercise Django's ORM. Standard operations -- create/update/delete, cascading deletes, unique-constraint enforcement -- are provided by Django and Postgres and are assumed to work. Test _your_ logic (business rules, signal receivers, custom managers/validation), not the framework's.

### Test

Run these tests locally with the `--migrations` and `--reuse-db` flags. On the first run, it will be necessary to use `--create-db` along with `--reuse-db` to get the database in a good state.

## Guidelines

### Adding Columns

- Use `db_default=<value>` instead of `default=<value>` for columns with defaults
- Nullable columns: use `null=True`
- Not null columns: must have `db_default` set


### Deleting Columns

1. Make column nullable (`null=True`) if not already
2. Remove all code references
3. Replace `RemoveField` with `SafeRemoveField(..., deletion_action=DeletionAction.MOVE_TO_PENDING)`
4. Deploy, then create second migration with `SafeRemoveField(..., deletion_action=DeletionAction.DELETE)`

### Removing a Model (and eventually its table)

1. Remove all code references

### Renaming Columns/Tables

Don't rename in Postgres. Use `db_column` or `Meta.db_table` to keep the old name.
