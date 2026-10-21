"""Tests for the order catalogue."""

from orders import gross_amount, tax_rate


def test_tax_rate_is_case_insensitive():
    assert tax_rate("it") == 0.22


def test_gross_amount_adds_the_country_tax():
    assert gross_amount({"net_amount": 100.0, "country": "IT"}) == 122.0
