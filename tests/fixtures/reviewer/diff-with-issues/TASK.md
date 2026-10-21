# Task: money amounts must use Decimal

## Goal

The catalogue currently computes gross amounts with binary floats. Replace them
with `Decimal` so that amounts are exact, and keep the existing tests passing.

## Acceptance criteria

- `tax_rate` returns a `Decimal`.
- `gross_amount` returns a `Decimal` rounded half-up to two decimal places.
- `gross_amount` rejects a float `net_amount` so money never passes through
  binary floating point.
- The tests cover the known-country path, the unknown-country path, the
  rounding, and the rejected float.
- Both public functions carry type hints.
