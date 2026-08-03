# Velora Inventory

A full-stack inventory management system for tracking products, categories, suppliers, and stock movements, built with a React/TypeScript frontend and a Node.js/Express REST API backed by SQLite.

## Screenshots

<!-- Add screenshots to the /screenshots folder and reference them below. -->

| Landing Page | Dashboard |
|---|---|
|<img width="1917" height="870" alt="image" src="https://github.com/user-attachments/assets/24b4e101-0e29-42a4-8773-1568d684fab5" />
|

| Products | Product Details |
|---|---|
| ![Products](screenshots/products.png) | ![Product details](screenshots/product-details.png) |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query |
| Backend | Node.js, Express, SQLite (`better-sqlite3`) |
| Auth | JWT (`jsonwebtoken`), password hashing (`bcryptjs`) |
| Testing | Jest, Supertest |

## Features

- Product, category, and supplier management with full CRUD
- Real-time stock tracking with an atomic in/out movement ledger
- Role-based access control (Admin / Staff)
- Dashboard with inventory analytics and stock-value charts
- Search, filtering, sorting, and pagination across all list views
- CSV export of the product catalog

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run setup    
npm run start     
```

### Frontend

```bash
cd frontend
npm install
npm run dev         
```

### Tests

```bash
cd backend
npm test
```

## License

This project is provided for demonstration purposes.
