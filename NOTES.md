# NOTES.md — Design Decisions & Trade-offs

## Data modeling
- **Normalization**: Categories and Suppliers are separate tables referenced by `Product.category_id` / `supplier_id` (1:N), and `StockMovement` references `Product` (1:N), exactly as specified. No denormalized duplication of category/supplier names on the product row — `category_name`/`supplier_name` are joined in at query time for display convenience only.
- **Referential integrity on delete**: rather than `ON DELETE CASCADE` for Category/Supplier → Product (which would silently destroy inventory data), deletes are `RESTRICT`ed at the DB level and pre-checked in the controller so the API can return a clear 409 with the blocking product count, per the brief's "prevent deleting a category/supplier that still has products" requirement. `StockMovement` *does* cascade from `Product`, since movement history is meaningless without its parent product.
- **Stock quantity is a materialized column** (`products.quantity_in_stock`) rather than derived by summing `stock_movements` on every read. This trades a small amount of write-time complexity (must update it inside the same transaction as the movement insert) for fast reads on list/dashboard endpoints, which are hit far more often than movements are recorded. The running balance shown in the stock-history view is computed on-demand from the movement log, so both views stay consistent and cross-checkable.

## Business rules & atomicity
- Stock movements are wrapped in a `better-sqlite3` transaction: read current quantity → validate the OUT doesn't go negative → update the product row → insert the movement row, all-or-nothing. `better-sqlite3` is synchronous, so there's no interleaving between the read and write within a single transaction — this avoids a classic race condition (two concurrent OUT requests both reading the same stale quantity).
- Validation runs in two layers: a lightweight rule-engine (`validation/schemas.js`) rejects malformed requests with 422 before touching the DB, and DB `CHECK` constraints (`unit_price >= 0`, `quantity_in_stock >= 0`, etc.) are a defensive second line in case application logic is ever bypassed — the error handler maps SQLite constraint violations to sensible HTTP codes as a fallback.

## API design
- Consistent envelope: list endpoints return `{ data, meta }`; single-resource endpoints return `{ data }`; errors return `{ error: { code, message, details } }`. This makes the frontend's error-handling code uniform across every entity.
- `category`/`supplier` filters and `status` (in/low/out of stock) are combinable with `search`, matching the brief precisely rather than only supporting one filter at a time.
- Sorting (`sortBy`/`sortDir`) was added beyond the minimum spec because a real inventory list is frequently sorted by price or stock level — implemented via a column allow-list to prevent SQL injection through the sort parameter.

## Frontend architecture
- No framework/bundler: ES modules loaded natively by the browser (`<script type="module">`). This was a deliberate choice for an entry-level assessment — it keeps every line of frontend code directly inspectable without a build step, while still being organized (api/state/router/components/pages) exactly like a small React app would be, so the same mental model transfers.
- Each page module (`products.js`, `categories.js`, `suppliers.js`, `dashboard.js`) owns its own local state and re-renders its own DOM subtree; there's no virtual DOM, but re-renders are scoped to `#content` and individual table bodies, so they stay fast at this data scale.
- The design system (CSS custom properties for the indigo/cyan/emerald palette, glassmorphism cards, motion tokens) lives in one file so every component — table, modal, toast, chart — draws from the same tokens rather than one-off styling.

## Authentication scope decision
The brief lists auth as a stretch goal and states the core API/UI should work without it. To reconcile that with "Admin can delete, Staff cannot," authentication is **optional for reads/writes** but **required (and role-checked) specifically on DELETE** for Products, Categories, and Suppliers. This was the most literal reading of both requirements simultaneously, and is called out explicitly here and in the README rather than left as a silent assumption.

## What I'd do differently with more time
- Bulk CSV import with row-level validation errors (listed as a stretch goal, not attempted).
- Move from SQLite to Postgres + a proper migration tool (e.g. `node-pg-migrate`) for a real multi-instance deployment.
- Add optimistic UI updates on the product table for stock movements instead of a full re-fetch.
- Add end-to-end (Playwright) tests on top of the current API-level Jest suite.
