"""Tests for the order catalogue."""

from decimal import Decimal

from orders import Order, gross_amount, tax_rate


def test_tax_rate_is_case_insensitive():
    assert tax_rate("it") == Decimal("0.22")


def test_unknown_country_has_no_tax():
    assert tax_rate("XX") == Decimal("0")


def test_gross_amount_adds_the_country_tax():
    order = Order(order_id="A-1", net_amount=Decimal("100.00"), country="IT")
    assert gross_amount(order) == Decimal("122.00")
