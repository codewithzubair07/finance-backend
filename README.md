# Finance Backend API

A production-ready REST API for a finance dashboard with role-based access control, financial record management, and analytics.

Built with **Node.js**, **Express**, and **MongoDB**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jsonwebtoken) |
| Validation | express-validator |
| Testing | Jest + Supertest |
| API Docs | Swagger UI |

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── swagger.js             # Swagger setup
│   ├── models/
│   │   ├── User.js                # User schema (name, email, password, role, status)
│   │   └── Record.js              # Financial record schema (amount, type, category, date)
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   ├── roleGuard.js           # Role-based access control
│   │   └── errorHandler.js        # Global error handler
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
│   │   └── dashboardService.js    # MongoDB aggregation pipelines
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── recordRoutes.js
│   │   └── dashboardRoutes.js
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point
├── tests/
│   ├── testSetup.js
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
- MongoDB (local) or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/codewithzubair07/finance-backend.git
cd finance-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start the development server
npm run dev
```

Server runs at: `http://localhost:5000`  
Swagger docs at: `http://localhost:5000/api-docs`

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## Roles & Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View financial records | ✅ | ✅ | ✅ |
| Create / Update / Delete records | ❌ | ❌ | ✅ |
| View dashboard summary | ❌ | ✅ | ✅ |
| View category breakdown | ❌ | ✅ | ✅ |
| View monthly trends | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT token |
| GET | `/api/auth/me` | All roles | Get current user info |

All protected routes require:
```
Authorization: Bearer <token>
```

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | Get all users (paginated) |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete a user |

### Financial Records
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/records` | All roles | Get records (paginated + filterable) |
| GET | `/api/records/:id` | All roles | Get record by ID |
| POST | `/api/records` | Admin | Create a new record |
| PUT | `/api/records/:id` | Admin | Update a record |
| DELETE | `/api/records/:id` | Admin | Soft delete a record |

**Filters:** `?type=expense&category=Food&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10`

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/summary` | Analyst, Admin | Total income, expenses, net balance |
| GET | `/api/dashboard/categories` | Analyst, Admin | Breakdown by category |
| GET | `/api/dashboard/trends` | Analyst, Admin | Monthly income vs expense trends |
| GET | `/api/dashboard/recent` | Analyst, Admin | Most recent transactions |

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

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

**Test results: 26 tests passing across 3 suites**

| Suite | Tests |
|-------|-------|
| auth.test.js | Register, login, token validation, duplicate email |
| records.test.js | CRUD, role restrictions, pagination, filtering, soft delete |
| dashboard.test.js | Summary accuracy, category breakdown, trends, access control |

---

## Request Flow

```
Request
  → auth.js middleware      (is the JWT token valid?)
  → roleGuard.js middleware (is this role allowed?)
  → validator               (is the input data valid?)
  → controller              (handle the request)
  → service                 (business logic + DB query)
  → Response
```

---

## Design Decisions

**Soft Delete** — Records are never permanently deleted. A `isDeleted` flag is set to `true` to preserve audit history, which is critical in finance systems.

**MongoDB Aggregation** — Dashboard APIs use aggregation pipelines for efficient server-side computation instead of fetching all records into memory.

**Layered Architecture** — Routes, controllers, and services are separated so business logic is testable independently of HTTP concerns.

**Password Security** — Passwords are hashed with bcrypt (12 rounds). The password field uses `select: false` so it is never returned in any query response.

**Admin Self-Protection** — Admins cannot deactivate or delete their own account to prevent accidental lockout.
