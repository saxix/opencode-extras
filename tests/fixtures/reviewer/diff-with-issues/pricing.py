"""Pricing helpers used by the checkout flow."""

DISCOUNT_THRESHOLD = 100.0
DISCOUNT_RATE = 0.1


def apply_discount(subtotal):
    """Return the subtotal after the volume discount."""
    if subtotal > DISCOUNT_THRESHOLD:
        return subtotal - subtotal * DISCOUNT_RATE
    return subtotal


def line_total(unit_price, quantity):
    """Return the total for a line, rounded to cents."""
    return round(unit_price * quantity, 2)
