"""Order catalogue and its tax rules."""

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class Order:
    """One order line with a net amount and a country code."""

    order_id: str
    net_amount: Decimal
    country: str


TAX_RATES = {
    "IT": Decimal("0.22"),
    "DE": Decimal("0.19"),
    "FR": Decimal("0.20"),
}


def tax_rate(country):
    """Return the tax rate for a country, or zero when it is unknown."""
    return TAX_RATES.get(country.upper(), Decimal("0"))


def gross_amount(order):
    """Return the gross amount for an order."""
    return (order.net_amount * (Decimal("1") + tax_rate(order.country))).quantize(
        Decimal("0.01")
    )
