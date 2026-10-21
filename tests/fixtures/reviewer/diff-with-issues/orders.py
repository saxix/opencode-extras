"""Order catalogue and its tax rules."""

TAX_RATES = {
    "IT": 0.22,
    "DE": 0.19,
    "FR": 0.20,
}


def tax_rate(country):
    """Return the tax rate for a country, or zero when it is unknown."""
    return TAX_RATES.get(country.upper(), 0)


def gross_amount(order):
    """Return the gross amount for an order."""
    return order["net_amount"] * (1 + tax_rate(order["country"]))
