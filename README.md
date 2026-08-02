# Velora Inventory — Product Inventory Management System

A full-stack CRUD application built for the Deimos Tech entry-level technical assessment. Manages products, categories, suppliers, and stock movements through a REST API backed by SQLite, with a premium, animated vanilla-JS single-page frontend.

## 1. Tech stack & why

| Layer      | Choice                                   | Why |
|------------|-------------------------------------------|-----|
| Backend    | Node.js + Express                         | Fast to build, huge ecosystem, easy to review line-by-line for an entry-level assessment. |
| Database   | SQLite via `better-sqlite3`               | Zero-config, single-file, synchronous API keeps transaction logic (stock movements) simple and race-free — no separate DB server needed to run the app "out of the box." |
| Auth       | JWT (`jsonwebtoken` + `bcryptjs`)         | Stateless, simple to reason about; used for the stretch-goal role system. |
| Frontend   | Vanilla JS (ES Modules) + hand-rolled design system CSS | Per the assessment FAQ, a framework isn't required. Vanilla JS keeps the bundle-free, build-step-free, and lets every animation/interaction be inspected directly — while still being fully modular (components/pages/router). |
| Testing    | Jest + Supertest                          | Standard, fast, well understood. |

No bundler, no framework lock-in: open `frontend/index.html` through any static file server and it runs.

## 2. Project structure

```
deimos-inventory/
├── backend/
│   ├── src/
│   │   ├── app.js, server.js        # Express app & entrypoint
│   │   ├── db/                      # schema.sql, connection, migrate, seed
│   │   ├── controllers/             # business logic per entity
│   │   ├── routes/                  # route wiring + validation + auth gates
│   │   ├── middleware/              # auth (JWT), centralized error handler
│   │   ├── validation/              # reusable rule-based validators + schemas
│   │   ├── utils/                   # ApiError, asyncHandler, pagination
│   │   └── __tests__/               # Jest + Supertest integration tests
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── css/styles.css               # full design system
│   └── js/
│       ├── app.js                   # boot/wiring
│       ├── api.js, state.js, router.js, icons.js, utils.js
│       ├── components/              # toast, modal, pagination, skeleton, charts
│       └── pages/                   # dashboard, products, categories, suppliers, authModal
├── docs/openapi.yaml                # full API documentation
├── docker-compose.yml
└── NOTES.md                         # design decisions & trade-offs
```

## 3. Prerequisites

- Node.js 18+ (tested on Node 20/22)
- npm

## 4. Local setup

```bash
cd backend
npm install
cp .env.example .env        # adjust JWT_SECRET if you like
npm run setup                # runs migrations, then seeds sample data
npm run start                # starts the API on http://localhost:4000
```

In a second terminal, serve the frontend as static files (any static server works):

```bash
cd frontend
python3 -m http.server 5500
# or: npx serve -l 5500
```

Open **http://localhost:5500** in your browser. The frontend talks to the API at `http://localhost:4000/api` by default — override with `window.__DEIMOS_API_BASE__` (set it in a `<script>` tag before `app.js` loads, or edit `js/api.js`) if you deploy the API elsewhere.

### Seed / demo data
`npm run setup` creates:
- 3 categories, 3 suppliers, 20 products (with a mix of in-stock, low-stock, and out-of-stock items) and stock-movement history.
- Two demo users for the auth stretch goal:
  - **Admin** — `admin` / `Admin@123` (can delete records)
  - **Staff** — `staff` / `Staff@123` (cannot delete — sign-in still works, but delete is blocked with 403)

The app is fully usable **without** signing in — authentication is opt-in per the assessment FAQ (auth is a stretch goal), but delete endpoints require an ADMIN token.

### Running tests
```bash
cd backend
npm test
```
16 integration tests cover CRUD, all business rules (unique SKU, non-negative stock/price, atomic stock movements, OUT-exceeds-stock rejection, email validation, referential-integrity deletes), and auth/role checks.

### Docker
```bash
docker compose up --build
```
Brings up the API (port 4000, persisted SQLite volume) and a static nginx server for the frontend (port 5500). The container seeds data automatically only if the database is empty, so restarts don't wipe your data.

## 5. API reference

Full OpenAPI 3.0 spec: [`docs/openapi.yaml`](docs/openapi.yaml). Summary:

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/products?search=&category=&supplier=&status=&page=&pageSize=&sortBy=&sortDir=` | status ∈ `in_stock`\|`low_stock`\|`out_of_stock` |
| POST | `/api/products` | validates name, sku (unique), unit_price ≥ 0, category/supplier existence |
| GET | `/api/products/:id` | |
| PUT | `/api/products/:id` | |
| DELETE | `/api/products/:id` | **ADMIN only** |
| GET | `/api/products/export/csv` | respects active filters |
| POST | `/api/products/:id/stock-movements` | `{ type: IN\|OUT, quantity, reason }` — atomic, rejects OUT > current stock |
| GET | `/api/products/:id/stock-movements` | history with running balance, paginated |
| GET/POST | `/api/categories` | |
| PUT/DELETE | `/api/categories/:id` | delete **ADMIN only**, blocked (409) if products reference it |
| GET/POST | `/api/suppliers` | |
| PUT/DELETE | `/api/suppliers/:id` | delete **ADMIN only**, blocked (409) if products reference it |
| GET | `/api/dashboard/summary` | totals, stock value, low/out-of-stock counts, category breakdown, recent movements |
| POST | `/api/auth/login` | returns JWT + user |
| GET | `/api/auth/me` | requires bearer token |

All errors follow: `{ "error": { "code": "...", "message": "...", "details": {...} } }`.

## 6. Stretch goals attempted

- ✅ Authentication & authorization (JWT, ADMIN/STAFF roles; Admin can delete, Staff cannot)
- ✅ Dashboard (summary cards + category stock-value bar chart + stock-status donut + recent movements)
- ✅ Stock-movement history per product with running balance
- ✅ CSV export of the product list (respects active filters)
- ✅ Automated tests (16 Jest/Supertest tests: business rules + API integration)
- ✅ Dockerized setup (`docker compose up`)
- ✅ API documentation (OpenAPI 3.0 — `docs/openapi.yaml`)
- ✅ UX polish (debounced search, skeleton loaders, toasts, smooth transitions, empty/error states, responsive layout)
- ⬜ Bulk CSV import — not attempted (prioritized correctness of the core + other stretch goals within the time window)
- ⬜ Live deployment — not deployed; run locally per instructions above (encouraged, not required per FAQ)

## 7. Known limitations & assumptions

- **SQLite** was chosen for zero-config portability. It's not intended for concurrent multi-writer production loads, but a production port to Postgres would only require swapping the `better-sqlite3` connection/query layer — the SQL is close to standard.
- **Auth is optional-by-default**: reads and non-destructive writes (create/update) do not require a token, matching the assessment's framing of auth as a stretch goal. Only `DELETE` on Products/Categories/Suppliers is gated to the `ADMIN` role. This is a documented interpretation, not an ambiguity left unresolved.
- **Low-stock threshold** is fixed at `< 10` units (per the brief) and is not currently user-configurable.
- **CSV export** streams the full filtered result set (no pagination) — fine for the scale of this assessment; would add streaming/chunking for very large catalogs.
- Full design-decision write-up with trade-offs is in [`NOTES.md`](NOTES.md).
