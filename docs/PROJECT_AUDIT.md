# SmartCart project audit

Audit date: 2026-10-12. Scope: source and configuration files enumerated by `rg --files` under `client` and `server`, excluding generated folders. Read-through concentrated on price, product, recommendation, comparison, cart/order, seed, auth/config and user-facing pricing paths; this is not a claim that every line of every listed UI file was manually reviewed.

## Inspected files and modules

- Root: `package.json`, `.gitignore`, `README.md`.
- Client: Vite/Tailwind configuration, `App.jsx`, API service, currency/date utilities, auth/cart/wishlist/compare contexts, product and comparison components, price-history chart, home/catalog/detail/finder/compare/wishlist/cart/checkout/order/profile/auth/admin pages.
- Server: `server.js`; env and Mongo connection; Product, PriceHistory, Order, Cart, User, Review and Wishlist models; product/order/cart/wishlist/recommendation/comparison/auth/review/admin controllers and routes; auth/error/validation middleware; product/order/auth/recommendation/review validators; recommendation/comparison engines; seed scripts/data; recommendation/comparison/cart-order/e2e test files.
- Package manifests and lockfiles for root/client/server; `server/.env.example`.

## Existing features and status

Catalog/search/filter/sort, product detail, Smart Finder, comparison (2–4, category constrained), wishlist, cart, simulated checkout, order history, reviews and admin CRUD/dashboard are implemented. Currency formatting already used INR in the shared client formatter, but multiple labels and calculations remained US-market assumptions. No live retailer feed or market-data credential is configured. The connected MongoDB state was not queried or modified in this audit.

## Findings and changes made

1. **Critical: seed destroyed all application collections.** `seedDatabase()` deleted users, products, price history, reviews, orders, carts and wishlists. Replaced it with an additive/idempotent seed keyed by email/slug; existing records are preserved.
2. **Critical: fabricated commerce signals.** Seed generated five invented historical observations per SKU, demo purchase/review records, and hardcoded product ratings/review totals. Those writes and sample ratings were removed. Empty history and unrated products are supported by existing endpoint/UI.
3. **High: checkout used US calculations.** Removed `$100` free-shipping threshold, `$9.99` fee, 8% tax, US checkout defaults and corresponding cart/checkout copy. Current checkout total is the server-calculated catalog subtotal; tax and shipping are zero because merchant policy is not configured.
4. **High: seed prices and MRPs were unverified but shown as discounts/deals.** Current seed values remain catalog examples and are not represented as verified retailer offers. Discount/MRP rendering is gated on verified pricing fields. Homepage “top deals” query now requires verification metadata.
5. **High: there was no auditable offer schema/import flow.** Added INR currency, model/configuration, observed retailer price, MRP, source, URL, checked timestamp and availability fields; PriceHistory now records source URL and availability. Added a JSON import CLI with exact brand/model/configuration matching, required HTTPS source and timestamp, duplicate observation checks and inserted/updated/skipped/failed report.
6. **High: CORS allowed every origin despite a whitelist.** Unknown origins are now rejected. Production now requires configured JWT and cookie secrets rather than known hardcoded fallback secrets.
7. **Medium: admin prices and several market banners were dollar-denominated.** Admin entry and cart, checkout, history, recommendation and comparison price labels were aligned to INR/catalog language.
8. **Medium: seed product ratings, seller identities and authorization flags were hardcoded.** New seed entries now start unrated with a neutral SmartCart catalog seller and no authorized-merchant claim.

## Prices and records

The seed catalog contains 18 product entries. Their numeric `price` values are legacy catalog examples, not live-verified retailer prices. Existing `originalPrice` values are unverified and must not be used as MRPs. One retailer listing was checked, but not applied to the catalog because the seed record does not identify the listing's color configuration: Sony WH-1000XM5 black, ₹31,990 observed price and ₹34,990 displayed MRP at [Reliance Digital](https://www.reliancedigital.in/product/sony-wh-1000xm5-bluetooth-headphone-with-30-hours-battery-life-black-l88xiz), verified 2026-10-12 23:33 IST; availability was not established. The product record was not changed. No database product rows were updated. Existing deployed data was only queried during an initial integration-test attempt; that run made no database writes. Later integration tests were isolated to in-memory MongoDB.

## Known issues and remaining work

- Checkout remains simulated; tax, shipping, payment provider and address validation rules need merchant/legal configuration. Current server treats catalog price as final and adds no charges.
- Checkout now merges duplicate lines, conditionally reserves stock and compensates reservations if a subsequent step fails. This is not a MongoDB transaction; a process crash between reservation and order persistence can still require stock reconciliation.
- Historical records already present in a deployed database may include fabricated seed observations from the old seeder. They were deliberately not deleted; audit/back up before selectively removing records whose source indicates synthetic seed history.
- The repo has no configuration for a current product feed. Verified prices must be supplied through the documented import file.
- The ignored `server/.env` contains a credential-bearing MongoDB connection URI. An initial test run caused the URI to appear in command output. The URI was subsequently removed from application log messages. Rotate the MongoDB database credential and replace the local secret before continuing to use that connection.
- Existing `originalPrice` data remains for backward compatibility but must be treated as unverified legacy data. Set `mrp` only from an independently verified source.
- Full browser workflows require MongoDB and a running client/server. Those external services were not available/configured for this audit.

## Prioritized plan

1. Configure merchant feed and verify each model/configuration; import sourced observations.
2. Review and back up live price-history rows before identifying legacy synthetic points.
3. Implement transaction-safe stock reservation and real merchant checkout/tax/shipping policies.
4. Run authenticated browser/API workflows against a configured test database; expand validation and checkout integrity tests.
5. Perform model-spec matching review for each catalog SKU and remove any inaccurate product/variant descriptions.
