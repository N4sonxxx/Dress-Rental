# 👗 GlamourRent — Party Dress Rental Platform

A full-stack party dress rental platform with a boutique-style experience for customers and a powerful admin dashboard for inventory and booking management.

> **Security-first architecture** — built with OWASP best practices from day one.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Express.js, TypeScript, Prisma ORM |
| **Database** | PostgreSQL |
| **Auth** | JWT (httpOnly cookies), bcrypt (12 rounds) |
| **Security** | Helmet, rate limiting, Zod validation, CORS |

## Architecture

```
rent_party_dress/
├── backend/             # Express API server
│   ├── prisma/          # Database schema + seed data
│   └── src/
│       ├── middleware/   # Auth, rate limiting, validation, error handling
│       ├── routes/      # Auth, dresses, bookings, availability, admin
│       ├── schemas/     # Zod validation schemas
│       └── utils/       # Prisma client, Winston logger
│
└── frontend/            # Next.js application
    └── src/
        ├── app/         # Pages (catalog, dress detail, booking, admin)
        ├── components/  # Reusable UI components
        └── lib/         # API client, utilities
```

## Features

### 🛍️ Customer Storefront
- Dress catalog with filters (size, color, style)
- Dress detail pages with availability calendar
- Booking form with date validation
- Mobile-first responsive design

### 🔐 Admin Dashboard
- **Overview** — inventory stats, late returns, upcoming returns
- **Dresses** — full CRUD inventory management
- **Bookings** — status workflow (inspection → rented → returned)
- **Security Vault** — ID/face photo uploads with deposit tracking

### 🛡️ Security Controls
- 3-tier rate limiting (general, auth, booking)
- Zod schema validation on all inputs
- Helmet with CSP headers
- httpOnly/secure/sameSite cookies (no JWT in response body)
- Constant-time auth comparison (prevents timing attacks)
- Randomized file upload names
- Structured security event logging

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Backend Setup
```bash
cd backend
cp .env.example .env     # Configure your DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev   # Create tables
npm run db:seed           # Seed admin user + sample dresses
npm run dev               # → http://localhost:4000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev               # → http://localhost:3000
```

### Default Admin Login
After seeding, login at `/admin/login` with:
- **Email:** `admin@glamourrent.com`
- **Password:** `GlamourRent2024!`

> ⚠️ **Change these credentials immediately in production.**

## Environment Variables

Copy `backend/.env.example` → `backend/.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random 64+ character string for token signing |
| `JWT_EXPIRES_IN` | Token expiry (default: `8h`) |
| `PORT` | API server port (default: `4000`) |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:3000`) |
| `UPLOAD_DIR` | File upload directory (default: `./uploads`) |
| `MAX_FILE_SIZE_MB` | Max upload size in MB (default: `10`) |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/dresses` | Public | List dresses with filters |
| `GET` | `/api/dresses/:id` | Public | Dress detail |
| `POST` | `/api/bookings` | Public | Create booking (rate limited) |
| `GET` | `/api/availability` | Public | Check date availability |
| `POST` | `/api/auth/login` | Public | Admin login (rate limited) |
| `GET` | `/api/admin/dashboard` | Admin | Dashboard stats |
| `PATCH` | `/api/bookings/:id/status` | Admin | Update booking status |
| `POST` | `/api/admin/vault` | Admin | Upload security documents |

## License

Private — All rights reserved.
