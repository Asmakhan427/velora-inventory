# Velora Inventory

A full-stack inventory management system for tracking products, categories, suppliers, and stock movements, built with a React/TypeScript frontend and a Node.js/Express REST API backed by SQLite.

### Home page
<img width="1917" height="870" alt="image" src="https://github.com/user-attachments/assets/24b4e101-0e29-42a4-8773-1568d684fab5" />

### Dashboard
<img width="1898" height="871" alt="image" src="https://github.com/user-attachments/assets/fd30f284-caa5-4e30-a11c-3cd2f7a84567" />

### Products
<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/8ead59f5-497e-483e-9512-02b9c030825c" />

### Product Details
<img width="850" height="856" alt="image" src="https://github.com/user-attachments/assets/27e95d8d-a805-4c87-9612-fcf65c62aaf9" />

### Categories
<img width="1914" height="865" alt="image" src="https://github.com/user-attachments/assets/cfd420de-777d-4faf-91d6-ce53ac34a96d" />


### Supplier
<img width="1919" height="867" alt="image" src="https://github.com/user-attachments/assets/bde6a055-f151-4d29-b674-dbe68d39f797" />


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
