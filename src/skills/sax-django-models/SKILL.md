---
name: sax-django-models
description: Design Django ORM models following architectural conventions for silos, replication, relocation, and foreign keys. Use when adding a new Django model, designing a model for a feature, deciding where data should live, picking a foreign key type, or refactoring an existing model's silo placement. Trigger on "add a Django model", "create a model", "design a model for X", "new database table", "store this data in the DB", "I need to track Y", "model for [feature]". Not for Pydantic models, dataclasses, ML models, or Protobuf -- this is specifically for Django ORM models in the  codebase.
---

# Model Conventions

This skill captures the _architectural_ decisions that go into a Dango model. It does not cover Django syntax, import order, or migration generation -- for those:

- Migrations: invoke the `django-migration` skill after the model is designed.

## Other norms worth encoding

### Base class and timestamps

Use `DefaultFieldsModel` for new models. It gives you `date_added` (`auto_now_add=True`) and `date_updated` (`auto_now=True`) for free, and it's almost always what you want -- tables that genuinely shouldn't track either timestamp are rare. `DefaultFieldsModelExisting` is legacy-only -- its docstring explicitly says don't use it on new models (it leaves `date_added` nullable for backward compat with models that predate the field).

### Field-type intent

- `BoundedBigAutoField` for primary keys, `BoundedBigIntegerField` / `BoundedPositiveIntegerField` for non-PK numeric IDs and counts. The "bounded" part is a runtime overflow guard, not a Django nicety -- it catches values that would silently corrupt downstream consumers.
- For bounded text fields without a strict spec, prefer `CharField(max_length=256)`. Postgres `varchar(n)` storage is identical regardless of `n` below the TOAST threshold, so picking 64 prematurely is a constraint without a benefit. Pick a smaller value only when the column has a real meaning (hash=40/64, UUID=32, slug, identifier with a spec).
- For free-form text fields, use `TextField`.
- For new JSON columns, prefer Django's `models.JSONField()` (jsonb-backed). The legacy `sentry.db.models.fields.jsonfield.JSONField` is text-backed and exists for compatibility with old columns -- only use it when intentionally matching one.
- Mutable callable defaults (`default=dict`, `default=list`) -- never bare `default={}` / `default=[]`.

### Soft delete is explicit

There is no metaclass-based soft delete. If a model needs soft delete, add an explicit `deleted` field using `BooleanField` and have business logic respect it. 

### Constraints over `unique_together`

For new models, use `Meta.constraints = [UniqueConstraint(...)]` instead of `unique_together`. The reason is `condition=Q(...)`: partial unique constraints are the only correct way to express "unique when this column is not null", which is a common requirement and silently broken with `unique_together`. Constraint and index names should be explicit and descriptive, not auto-generated.

### Composite indexes match query order

If you filter on `(org_id, project_id, type)` together, you need an index whose field order matches the most-selective-first filter pattern. A foreign key auto-index does _not_ cover the multi-column case.

### Where the file lives

- Default: put new models in an app under `src/<main_package>/models/<thing>.py`  (one model per file) -- pick by precedent in the app.


## Mandatory attributes
### Doctest

Model must provide a doctest (```"""...."""```) that describes the Model purpose

### Fields
Each field MUST have the following attributes

**verbose_name**: to properly translated each field must provide a`gettext` label
**help_text**: description of the field from the business logic perspective. How it is used, what business informmations provides, impact on business flow.

## A minimal cell-silo model skeleton

This is a starting scaffold, not a template -- strip what you do not need, do not add things you do not need.

```python
from django.db import models
from django.utils.translation import gettext as _

class MyThing(models.Model):
    organization = models.ForeignKey("Organization")
    name = models.CharField(verbose_name=_("Name"), max_length=256, help_text=_("...."))
    config = models.JSONField(verbose_name=_("Configuration"), default=dict, help_text=_("...."))

    class Meta:
        app_label = "app"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"],
                name="mything_org_name_unique",
            ),
        ]
```

## After the model is designed

1. Generate the migration: invoke the `django-migration` skill.
3. If the app's `models/__init__.py` re-exports its models, add your new one there too -- it's a convenience for callers (`from <prj>.<app>.models import Thing`), not a Django requirement, so match the app's precedent.
