# AuthinGo

An authentication and role-based access control (RBAC) API built with Go, using the Chi router and MySQL.

## Tech Stack

- **Language:** Go 1.24
- **Router:** [go-chi/chi/v5](https://github.com/go-chi/chi)
- **Database:** MySQL with `database/sql` and `go-sql-driver/mysql`
- **Auth:** JWT (`golang-jwt/jwt/v5`) + bcrypt password hashing
- **Validation:** `go-playground/validator/v10`
- **Migrations:** [goose](https://github.com/pressly/goose)
- **Rate Limiting:** `golang.org/x/time/rate`

## Project Structure

```
AuthinGo/
├── app/application.go          # App bootstrap (config, DI, server setup)
├── config/
│   ├── db/db.go                # MySQL connection setup
│   └── env/env.go              # Env var loader (godotenv)
├── controllers/
│   ├── ping.go                 # Health check endpoint
│   ├── user.go                 # User endpoints handler
│   └── role.go                 # RBAC endpoints handler
├── db/
│   ├── migrations/             # 5 goose migration files
│   └── repositories/           # Data access layer (5 repositories)
├── dto/
│   ├── auth.go                 # Login, CreateUser, GetUserById DTOs
│   └── role.go                 # Role & permission DTOs
├── middlewares/
│   ├── auth.go                 # JWT auth, RequireAllRoles, RequireAnyRole
│   ├── rate_limiter.go         # Token-bucket rate limiter (5 req/min)
│   ├── sample.go               # Request logger
│   └── validator.go            # Request body validators (6 validators)
├── models/
│   ├── user.go                 # User model
│   └── rbac.go                 # Role, Permissions, RolePermission models
├── router/
│   ├── router.go               # Main router setup
│   ├── user_router.go          # User routes
│   └── role_router.go          # Role & RBAC routes
├── services/
│   ├── user_service.go         # User business logic (auth, JWT signing)
│   └── role_service.go         # Role business logic
├── utilities/
│   ├── json.go                 # JSON response helpers & validator instance
│   ├── proxy.go                # Reverse proxy helper (fakestoreapi)
│   ├── stringformat.go         # Role string formatting
│   └── user.go                 # bcrypt hash/verify helpers
├── main.go                     # Entry point
├── Makefile                    # goose migration commands
├── go.mod / go.sum
└── .env                        # Environment config
```

## Features

### Authentication
- **User Signup** (`POST /signup`) — creates user with bcrypt-hashed password
- **User Login** (`POST /login`) — validates credentials, returns JWT (HS256, 24h expiry)
- **JWT Middleware** — validates `Authorization: Bearer <token>` on protected routes, injects `userId` and `email` into request context

### User Management
- **Get User by ID** (`GET /profile`) — protected, requires `user` or `admin` role
- User repository with CRUD operations

### Role-Based Access Control (RBAC)
- **Roles:** Create, Read (by ID, all), Update, Delete
- **Permissions:** Create, Read (by ID, all), Update, Delete (repository layer complete, controller not yet exposed)
- **Assign/Remove Permissions** to/from roles
- **Assign Role to User** — protected by `admin` role only
- **RequireAllRoles** middleware — user must have all specified roles
- **RequireAnyRole** middleware — user must have at least one specified role
- **HasPermissions** / **HasRole** / **GetUserPermissions** repository methods

### API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/ping` | — | Health check |
| GET | `/profile` | JWT, role: user/admin | Get user profile |
| POST | `/signup` | — | Register new user |
| POST | `/login` | — | Login, returns JWT |
| GET | `/roles/{id}` | — | Get role by ID |
| GET | `/roles` | — | List all roles |
| POST | `/roles` | — | Create role |
| PUT | `/roles/{id}` | — | Update role |
| DELETE | `/roles/{id}` | — | Delete role |
| GET | `/roles/{roleId}/permissions` | — | Get role's permissions |
| POST | `/roles/{roleId}/permissions` | — | Assign permission to role |
| DELETE | `/roles/{roleId}/permissions` | — | Remove permission from role |
| GET | `/role-permissions` | — | List all role-permission mappings |
| POST | `/users/{userId}/roles/{roleId}` | JWT, role: admin | Assign role to user |
| GET | `/fakestoreservice/*` | — | Reverse proxy to fakestoreapi.in |

### Middleware Stack
1. **Chi Logger** — request logging
2. **Rate Limiter** — 5 requests per minute (token bucket)
3. **JWT Auth** — bearer token validation
4. **Request Validators** — per-route struct validation via `go-playground/validator`
5. **Role Checkers** — `RequireAllRoles` / `RequireAnyRole`

### Database Schema (MySQL, 5 tables)
- **users** — id, username, email, password, created_at, updated_at
- **roles** — id, name (unique), description, created_at, updated_at
- **permissions** — id, name (unique), description, resource, action, created_at, updated_at
- **user_roles** — id, user_id (FK), role_id (FK), created_at, updated_at
- **role_permissions** — id, role_id (FK), permission_id (FK), created_at, updated_at

### Migrations
Managed via Goose. Commands:
```bash
make migrate-up          # Apply all migrations
make migrate-down        # Rollback last migration
make migrate-reset       # Rollback all
make migrate-status      # Show status
make migrate-create name="migration_name"   # New migration
```

## Configuration (`.env`)

```
PORT=":3001"
DBName="auth_dev"
DB_ADDR="127.0.0.1:3306"
DB_USER="aneesh"
DB_PASSWORD="aneesh123"
DB_NET="tcp"
JWT_SECRET="aneeshkolar123"
```

## Running

```bash
go run main.go
```

Server starts on the configured port (default `:3001`).
