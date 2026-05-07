# Water Maintenance Log System

A full-stack **Laravel 12 + React + Inertia.js** water maintenance management system with role-based access control, comprehensive sample data, and session-based authentication.

**System Version**: 2.2 | **Last Updated**: May 7, 2026 | **Status**: ✅ Development Ready with Sample Data

---

## Architecture

The application uses **Inertia.js** as the bridge between the Laravel backend and React frontend. There are **no API calls from the frontend** — all data is loaded server-side via `WebDashboardController` and passed as Inertia props. Navigation between views uses `router.get()` / `router.post()` from `@inertiajs/react`.

```
Browser ←→ Inertia.js ←→ Laravel (WebDashboardController) ←→ SQLite / PostgreSQL
```

- **Auth**: Cookie/session-based (Laravel Fortify) — no Sanctum tokens on the frontend
- **Data flow**: Server renders Inertia pages with `{auth, dashboardData, viewData, currentView}` props
- **Mutations**: `router.post()` to web routes → controller → redirect back with fresh data
- **Public complaints**: Unauthenticated users can submit complaints from the homepage

> The REST API (`routes/api.php`) still exists for potential mobile app or third-party integration but is **not used by the React frontend**.

---

## Features

- ✅ **React Frontend** (JavaScript, no TypeScript) with Inertia.js
- ✅ **Session-based authentication** (cookie sessions via Laravel Fortify)
- ✅ **Role-based access control** (ADMIN, ENGINEERING, MAINTENANCE, CONSUMER) — one canonical admin & engineer per installation
- ✅ **Complaint priority assignment** — admins set priority when forwarding to engineering (not user-controlled)
- ✅ **Role-specific dashboards** with server-side data loading
- ✅ **Public complaint submission** (no login required)
- ✅ **Password change** functionality for all users
- ✅ **SQLite** for local development (with sample data)
- ✅ **PostgreSQL** support for production (Supabase compatible)
- ✅ No public self-registration — admin creates all staff accounts
- ✅ No frontend API calls — all data via Inertia server-side props
- ✅ **Comprehensive sample data** — 11 user accounts, 10 complaints, 7 work orders with reports

---

## Default Login Credentials

> ⚠️ **Change these passwords immediately after first login!**

| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@watermaintenance.local` | `Admin123!` |
| ENGINEERING | `engineering@watermaintenance.local` | `Engineering123!` |
| MAINTENANCE | `tom.anderson@watermaintenance.local` | `Maintenance123!` |
| MAINTENANCE | `alex.martinez@watermaintenance.local` | `Maintenance123!` |
| MAINTENANCE | `chris.lee@watermaintenance.local` | `Maintenance123!` |
| MAINTENANCE | `jake.miller@watermaintenance.local` | `Maintenance123!` |
| MAINTENANCE | `ryan.garcia@watermaintenance.local` | `Maintenance123!` |
| MAINTENANCE | `anthon@gmail.com` | `Maintenance123!` |




| CONSUMER | `sarah.johnson@watermaintenance.local` | `Consumer123!` |
| CONSUMER | `mike.wilson@watermaintenance.local` | `Consumer123!` |
| CONSUMER | `lisa.garcia@watermaintenance.local` | `Consumer123!` |

> **Note:** This system enforces a single canonical ADMIN and ENGINEERING account per installation. Additional staff accounts (MAINTENANCE, CONSUMER) can be created as needed via admin panel.

### Password Pattern
All accounts follow the pattern: **`{Role}123!`**
- Admin accounts: `Admin123!`
- Engineering accounts: `Engineering123!`  
- Maintenance accounts: `Maintenance123!`
- Consumer accounts: `Consumer123!`

---

## Quick Start

### 1. Install dependencies
```bash
composer install
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database setup

**Development (SQLite with Sample Data) — Recommended:**
```bash
php artisan migrate:fresh --seed
```

This command will:
1. Drop all existing tables
2. Run all database migrations
3. Seed with canonical admin/engineering accounts
4. Create 11 user accounts (admin, engineer, 6 maintenance staff, 3 consumers)
5. Generate 10 sample complaints with varied statuses
6. Generate 7 work orders with associated maintenance reports

The database file will be created automatically at `database/database.sqlite`.

**Development (SQLite without Sample Data):**
```bash
touch database/database.sqlite
php artisan migrate
php artisan db:seed --class=AdminEngineeringSeeder
```

**Production (PostgreSQL/Supabase) — update `.env`:**
```env
DB_CONNECTION=pgsql
DB_HOST=your-supabase-host.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
DB_SSLMODE=require
SESSION_DRIVER=file
```
Then run:
```bash
php artisan migrate --force
php artisan db:seed --class=AdminEngineeringSeeder
php artisan db:seed --class=DatabaseSeeder  # Optional: for sample data
```

### 4. Build frontend & start server
```bash
npm run build
php artisan serve
```

Server runs at: `http://127.0.0.1:8000`

> For active frontend development, run `npm run dev` in a separate terminal alongside `php artisan serve`.

---

## File Structure

### Backend (PHP/Laravel)
```
app/Http/Controllers/
├── WebDashboardController.php           # Main controller — all Inertia rendering & mutations
│
├── Api/                                  # REST API (kept for mobile/third-party, not used by frontend)
│   ├── Admin/
│   │   └── UserManagementController.php
│   ├── ComplaintController.php
│   ├── DashboardController.php
│   ├── MaintenanceReportController.php
│   ├── UserController.php
│   └── WorkOrderController.php

app/Http/Middleware/
├── HandleInertiaRequests.php            # Shares auth & Ziggy props to all Inertia pages
├── RoleMiddleware.php                   # Role-based access control
├── AdminAccess.php
├── EngineeringAccess.php
└── MaintenanceAccess.php

routes/
├── web.php                              # All frontend routes (Inertia-rendered)
└── api.php                              # REST API routes (not used by frontend)
```

### Frontend (React + Inertia.js)
```
resources/js/pages/
├── Home.jsx                             # Public landing page + complaint form
├── Admin/
│   ├── Dashboard.jsx                    # Admin overview, navigation, stat cards
│   ├── complaints/ComplaintsList.jsx    # All complaints + forward/assign actions
│   ├── reports/ReportsList.jsx          # Maintenance reports viewer
│   ├── users/UsersList.jsx             # User management (create/edit/delete)
│   └── work-orders/WorkOrdersList.jsx  # Work orders management
├── Engineering/
│   ├── Dashboard.jsx                    # Engineering overview + navigation
│   └── approvals/
│       ├── PendingApprovals.jsx         # Review & approve/decline complaints
│       ├── ApprovedList.jsx
│       └── DeclinedList.jsx
├── Maintenance/
│   ├── Dashboard.jsx                    # Maintenance overview + task cards
│   ├── reports/SubmitReport.jsx         # Submit work completion report
│   └── tasks/
│       ├── AssignedTasks.jsx            # Active task list with start/complete actions
│       └── TaskHistory.jsx             # Completed task history
└── Consumer/
    ├── Dashboard.jsx                    # Consumer overview + complaint stats
    └── complaints/
        ├── ComplaintsList.jsx           # User's complaints list
        └── SubmitComplaintModal.jsx     # Submit new complaint modal
```

### Key Files
- `routes/web.php` — All web routes (Inertia-rendered pages + POST mutations)
- `app/Http/Controllers/WebDashboardController.php` — Central controller for all dashboard logic
- `app/Http/Middleware/HandleInertiaRequests.php` — Shares `auth` and `ziggy` props
- `bootstrap/app.php` — Middleware configuration (Inertia, CSRF exceptions)
- `database/seeders/AdminEngineeringSeeder.php` — Creates single canonical admin & engineer accounts
- `database/seeders/DatabaseSeeder.php` — Creates 11 user accounts + 10 complaints + 7 work orders (sample data)
- `app/Models/User.php` — User model with roles enum

---

## User Roles & Permissions

### ADMIN
- ✅ Create and manage all users (including maintenance staff)
- ✅ View all complaints and work orders
- ✅ Forward complaints to engineering
- ✅ Assign work orders to maintenance staff
- ✅ Full system access

### ENGINEERING
- ✅ Review, approve, and decline complaints
- ✅ Monitor approved work orders
- ✅ View engineering-specific dashboard and reports

### MAINTENANCE
- ✅ View assigned work orders
- ✅ Start and complete work
- ✅ Submit maintenance reports
- ✅ View own work history

### CONSUMER
- ✅ Submit complaints (authenticated)
- ✅ View own complaint status
- ✅ Track work order progress

### PUBLIC (no login required)
- ✅ Submit complaints from the homepage

> All authenticated roles can change their own password at any time.

---

## Complaint Workflow

The complaint lifecycle flows through five main stages, with priority assignment occurring at the forwarding step:

```
1. PENDING (Initial Submission)
   ├─ Public user or authenticated consumer submits complaint
   ├─ Status: "pending"
   └─ Priority: auto-set to "normal" (user cannot choose)

2. SUBMITTED TO ENGINEERING (Admin Forward)
   ├─ Admin reviews pending complaint
   ├─ Admin selects priority level (low, normal, high, urgent) ← ADMIN SELECTS HERE
   ├─ Admin includes optional notes
   ├─ Status: "submitted_to_engineering"
   └─ Assigned to: canonical ENGINEERING account

3. APPROVED / DECLINED (Engineering Review)
   ├─ Engineering team reviews complaint
   ├─ Decision: approve (→ assigned) or decline (ends workflow)
   └─ Status: "approved" or "declined"

4. ASSIGNED (Work Order Creation)
   ├─ Admin creates work order from approved complaint
   ├─ Work order assigned to maintenance staff
   ├─ Status: "assigned"
   └─ Maintenance team receives task

5. IN PROGRESS → COMPLETED (Maintenance Execution)
   ├─ Maintenance staff starts work
   ├─ Status: "in_progress"
   ├─ Maintenance submits completion report
   └─ Status: "completed"
```

**Key Points:**
- **Priority is set by Admin**, not by the user submitting the complaint
- Priority options: **low**, **normal**, **high**, **urgent** (defaults to normal if not specified)
- Only **one canonical Engineering account** receives all forwarded complaints, ensuring single queue visibility
- Once declined, complaints do not proceed to work orders
- All complaints (pending, approved, declined) remain in the system for audit trail

---

## Dashboard Features by Role

| Dashboard | Key Stats |
|-----------|-----------|
| **Admin** | Pending complaints, pending assignments, active work orders, completed this month, total users |
| **Engineering** | Pending reviews, approved/declined this week, total reviews, pending complaints list |
| **Maintenance** | Assigned tasks, in-progress tasks, completed this month, hours this month |
| **Consumer** | Total complaints, pending, in progress, completed |

---

## Web Routes

### Public Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Homepage with public complaint form |
| POST | `/complaints/public` | Submit complaint without login (CSRF-exempt) |
| GET | `/login` | Staff login page |
| POST | `/login` | Authenticate user |
| POST | `/logout` | Logout (destroy session) |

### Authenticated Routes (session required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Role-specific dashboard (accepts `?view=` query parameter) |
| POST | `/dashboard/complaints` | Submit complaint (Consumer) |
| POST | `/dashboard/complaints/{id}/forward` | Forward complaint to engineering (Admin) |
| POST | `/dashboard/complaints/{id}/approve` | Approve complaint (Engineering) |
| POST | `/dashboard/complaints/{id}/decline` | Decline complaint (Engineering) |
| POST | `/dashboard/work-orders` | Create & assign work order (Admin) |
| POST | `/dashboard/work-orders/{id}/start` | Start work on order (Maintenance) |
| POST | `/dashboard/work-orders/{id}/complete` | Complete work order (Maintenance) |
| POST | `/dashboard/reports` | Submit maintenance report (Maintenance) |
| POST | `/dashboard/users` | Create user (Admin) |
| PUT | `/dashboard/users/{id}` | Update user (Admin) |
| DELETE | `/dashboard/users/{id}` | Delete user (Admin) |

### Dashboard Views (via `?view=` parameter)

| Role | View Parameter | Content |
|------|---------------|---------|
| All | `dashboard` (default) | Overview stats + recent items |
| Admin | `complaints` | All complaints list |
| Admin | `work-orders` | All work orders list |
| Admin | `users` | User management |
| Admin | `reports` | Maintenance reports |
| Engineering | `pending-approvals` | Complaints awaiting review |
| Engineering | `approved` | Approved complaints |
| Engineering | `declined` | Declined complaints |
| Engineering | `reports` | Maintenance reports |
| Maintenance | `assigned-tasks` | Active assigned work orders |
| Maintenance | `task-history` | Completed work history |
| Maintenance | `submit-report` | Report submission form |
| Consumer | `complaints` | User's own complaints |

---

## REST API (Optional — for mobile/third-party)

The REST API at `/api/v1/` is fully functional but **not used by the React frontend**. It uses Laravel Sanctum bearer token authentication.

### Public API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/login` | Login (returns bearer token) |
| GET | `/api/v1/status` | API status |

### Authenticated API Endpoints (Bearer Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Get authenticated user |
| GET | `/api/v1/dashboard` | Role-specific dashboard data |
| GET | `/api/v1/complaints` | Get complaints (filtered by role) |
| POST | `/api/v1/complaints` | Submit complaint |
| GET | `/api/v1/work-orders` | Get work orders (filtered by role) |
| GET | `/api/v1/maintenance-reports` | Get maintenance reports |
| POST | `/api/change-password` | Change password |
| POST | `/api/logout` | Logout (revoke token) |

### Admin API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List all users |
| POST | `/api/v1/admin/users` | Create user |
| PUT | `/api/v1/admin/users/{id}` | Update user |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |

---

## Security Features

- ✅ No public self-registration — admin creates all staff accounts
- ✅ Session-based authentication with encrypted cookies
- ✅ CSRF protection on all POST routes (public complaint route exempted)
- ✅ Role-based access control via middleware
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Session invalidation on logout (no DB queries)
- ✅ API throttling (60 requests/minute)
- ✅ SQL injection protection via Eloquent ORM & parameterized queries
- ✅ Inertia.js prevents direct page access without server-side auth check

---

## Production Configuration

```env
APP_ENV=production
APP_DEBUG=false
SESSION_DRIVER=cookie
SESSION_SECURE_COOKIE=true
```

- Install PostgreSQL PHP extension: `apt-get install php-pgsql`
- Configure SSL connection for Supabase (`DB_SSLMODE=require`)
- Use HTTPS in production (required for secure cookies)
- Never expose `.env` files
- Set `SESSION_SECURE_COOKIE=true` in production

---

## Development Commands

```bash
# Clear caches
php artisan config:clear && php artisan route:clear

# List all web routes
php artisan route:list --path=/

# List API routes (optional)
php artisan route:list --path=api

# Run tests
php artisan test

# Code formatting
./vendor/bin/pint

# Build frontend
npm run build

# Development server with hot reload
npm run dev  # in one terminal
php artisan serve  # in another terminal

# Reset database with sample data
php artisan migrate:fresh --seed

# Reset database with canonical accounts only
php artisan migrate:fresh
php artisan db:seed --class=AdminEngineeringSeeder
```

---

## Troubleshooting

**Server not starting?**
```bash
php artisan config:clear
php artisan route:clear
php artisan serve
```

**Database issues?**
```bash
# Reset with sample data
php artisan migrate:fresh --seed

# Or reset with canonical accounts only
php artisan migrate:fresh
php artisan db:seed --class=AdminEngineeringSeeder
```

**419 Page Expired on public complaint form?**
- Ensure `complaints/public` is listed in CSRF exceptions in `bootstrap/app.php`
- Clear config cache: `php artisan config:clear`

**Dashboard shows no data?**
- Verify database connection in `.env`
- Check `WebDashboardController::getDashboardStats()` for query errors
- View logs: `storage/logs/laravel.log`

**Blank page after login?**
- Run `npm run build` to compile React assets
- Check `resources/views/app.blade.php` includes `@vite` directive
- Ensure `public/build/` directory exists

**Check logs:**
```bash
# View latest application logs
cat storage/logs/laravel.log
```