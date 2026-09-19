# Testing Patterns: Factories & Fixtures

These optional factory/fixture examples illustrate a separation between model generation and
test data provision. Apply them only when consistent with the target repository's existing
tests. They do not require installing factory-boy, introducing custom base classes, or changing
the test runner. Local project instructions take precedence.

## Pattern for projects using factory-boy and pytest

1. **Isolation:** Prefer fixtures when they make setup clearer and reusable; follow local practice.
2. **Layering:** Use existing factories in the project's established test utilities directory.
3. **Wrapping:** Pytest fixtures can wrap factories, customizing them for specific scenarios.
4. **Consistency:** Fixtures should be clear, specific, and defined in the same test file that uses them.
5. **Reusability:** Common fixtures can reside in `conftest.py` if they are reused across multiple modules.

## Implementation Pattern

### 1. Define the Factory
Factories create low-level test objects. For example, with factory-boy already configured:

```python
import factory

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "auth.User"  # Use the project's actual user model.
```

### 2. Define the Fixture
Fixtures "wrap" the factory. Use `Factory.create()` to ensure proper type hinting for `mypy`.

```python
@pytest.fixture
def user() -> "User":
    """Standard user fixture."""
    from testutils.factories import UserFactory
    return UserFactory.create()
```

## Test Configuration
- **Markers:** use only markers registered by the target project.
- **DB reuse:** use pytest-django flags only when supported and not already configured.
- **Coverage:** follow actual repository thresholds and commands; no universal threshold or tox environment is assumed.

## Best Practices
- **Importing:** Avoid importing Django models or Factories at the module level in test files to prevent premature Django initialisation. Import them inside the fixture function or use `if TYPE_CHECKING`.
- **Customization:** use the project's existing fixture overrides or factory arguments. Custom helpers require repository evidence.
