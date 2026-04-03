# Finance Backend API

A backend system for a finance dashboard supporting financial record management, role-based access control, and analytics APIs.

Built with **Node.js**, **Express**, and **MongoDB**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Roles & Permissions](#roles--permissions)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Assumptions & Design Decisions](#assumptions--design-decisions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jsonwebtoken) |
| Validation | express-validator |
| Testing | Jest + Supertest + mongodb-memory-server |
| API Docs | Swagger UI (swagger-jsdoc) |

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── swagger.js         # Swagger setup
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Record.js          # Financial record schema
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── roleGuard.js       # Role-based access control
│   │   └── errorHandler.js    # Global error handler
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   └── recordValidator.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── recordController.js
│   │   └── dashboardController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── recordService.js
│   │   └── dashboardService.js  # MongoDB aggregation pipelines
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── recordRoutes.js
│   │   └── dashboardRoutes.js
│   ├── app.js                 # Express app
│   └── server.js              # Entry point
├── tests/
│   ├── testSetup.js           # In-memory MongoDB helper
│   ├── auth.test.js
│   ├── records.test.js
│   └── dashboard.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local) or a [MongoDB Atlas](https://www.mongodb.com/atlas) free-tier account

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd finance-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start the development server
npm run dev
```

The server will start at `http://localhost:5000`.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/finance_db
```

---

## Roles & Permissions

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View financial records | ✅ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| View dashboard summary | ❌ | ✅ | ✅ |
| View category breakdown | ❌ | ✅ | ✅ |
| View monthly trends | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT token |
| GET | `/api/auth/me` | All roles | Get current user info |

**Register example:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "viewer"
}
```

**Login example:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "secret123"
}
```

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Get all users (paginated) |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PUT | `/api/users/:id` | Admin | Update user (name, role, status) |
| DELETE | `/api/users/:id` | Admin | Delete a user |

**Pagination:** `GET /api/users?page=1&limit=10`

---

### Financial Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/records` | All roles | Get records (paginated + filterable) |
| GET | `/api/records/:id` | All roles | Get record by ID |
| POST | `/api/records` | Admin | Create a new record |
| PUT | `/api/records/:id` | Admin | Update a record |
| DELETE | `/api/records/:id` | Admin | Soft delete a record |

**Filters:** `GET /api/records?type=expense&category=Food&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10`

**Create record example:**
```json
POST /api/records
{
  "amount": 50000,
  "type": "income",
  "category": "Salary",
  "date": "2024-03-01",
  "notes": "March salary"
}
```

---

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Analyst, Admin | Total income, expenses, net balance |
| GET | `/api/dashboard/categories` | Analyst, Admin | Breakdown by category |
| GET | `/api/dashboard/trends` | Analyst, Admin | Monthly income vs expense trends |
| GET | `/api/dashboard/recent` | Analyst, Admin | Most recent activity |

**Example response — `/api/dashboard/summary`:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 150000,
    "totalExpenses": 45000,
    "netBalance": 105000,
    "incomeCount": 6,
    "expenseCount": 18,
    "totalRecords": 24
  }
}
```

---

## Running Tests

Tests use an **in-memory MongoDB** instance (no real DB needed).

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Test coverage includes:
- Auth: register, login, token validation, duplicate email
- Records: CRUD, role restrictions, pagination, filtering, soft delete
- Dashboard: summary accuracy, category breakdown, trends, access control

---

## API Documentation

Swagger UI is available at:

```
http://localhost:5000/api-docs
```

All endpoints are documented with request/response schemas.

---

## Assumptions & Design Decisions

**1. Soft Delete for Records**
Records are never permanently deleted — a `isDeleted` flag is set to `true`. This preserves audit history and reflects real-world finance systems where data integrity is critical.

**2. Role Assignment on Register**
Users can self-assign a role during registration for simplicity. In a production system, role assignment would be restricted to admins only.

**3. Password in Schema**
Passwords are hashed with bcrypt (12 rounds) before storage. The `password` field uses `select: false` so it is never returned in queries.

**4. Admin Self-Protection**
Admins cannot deactivate or delete their own account to prevent accidental lockout.

**5. Dashboard Aggregation**
Dashboard APIs use MongoDB aggregation pipelines directly for efficient server-side computation rather than fetching all records and processing in JavaScript.

**6. In-Memory DB for Tests**
Tests use `mongodb-memory-server` for full isolation — no real database connection needed. Each test suite starts fresh with a clean DB state.

**7. Viewer Role**
Viewers can read all financial records but cannot access dashboard analytics. This separates raw data access from analytical insights, which may require additional context or permissions.
