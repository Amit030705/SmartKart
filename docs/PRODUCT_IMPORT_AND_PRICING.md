# Verified price import

SmartCart has no live retailer feed configured. Do not treat `Product.price` or legacy `originalPrice` in the demo seed as a current market quote. `price` is the merchant's catalog/checkout amount. `observedPrice` is an external retailer observation and does not overwrite checkout price. `mrp` is optional and only valid when explicitly verified.

## Source check performed for this audit

On 2026-10-12 at 23:33 IST, Reliance Digital listed the black Sony WH-1000XM5 headphones at ₹31,990 with MRP ₹34,990 on its [direct product page](https://www.reliancedigital.in/product/sony-wh-1000xm5-bluetooth-headphone-with-30-hours-battery-life-black-l88xiz). Availability was not confirmed. This offer was not imported because the existing SmartCart listing does not specify color and exact configuration; it remains a documented source check, not a catalog offer.

## Supply verified records

Create a JSON array. Each row must match one existing product's exact `brand`, `model`, and `configuration` fields; ambiguous and missing matches are skipped. Model/configuration fields must already be curated on the target product. Do not infer a configuration from a similar product title.

```json
[
  {
    "brand": "Example brand",
    "model": "Exact model code",
    "configuration": "Exact RAM/storage/variant",
    "price": 12345,
    "mrp": 14000,
    "source": "Authorized retailer name",
    "sourceUrl": "https://retailer.example/product-page",
    "verifiedAt": "2026-10-12T10:30:00+05:30",
    "availability": "unknown"
  }
]
```

Only submit the actual verified amount, exact direct product URL, retailer name, observation timestamp and known availability. Omit unknown availability or use `unknown`. Importer accepts HTTPS URLs only. It does not scrape websites or claim a feed is live.

Run from `server`: `npm run import:prices -- path/to/verified-prices.json`. It updates observed offer metadata and appends a timestamped price-history point idempotently. It reports inserted, updated, skipped and failed rows. Back up the database before operational imports. `npm run seed` is additive; it never clears user or commerce data.

## Price display rules

- Catalog price is formatted as INR and remains the server checkout price.
- Retailer observations are separate and should include retailer, checked date and link.
- MRP/discount display requires a verified observation and valid `mrp` greater than `observedPrice`.
- Price history contains observations only; no seed-generated historical points are created.
- `lowest` comparison refers only to the selected catalog products, not the whole Indian market.
