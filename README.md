# Water Maintenance Log System

A full-stack **Laravel 12 + React** water maintenance management system with role-based access control, Supabase PostgreSQL, and Laravel Sanctum authentication.

**System Version**: 1.0 | **Last Updated**: March 4, 2026 | **Status**: ✅ Ready for Production Use

---

## Features

- ✅ **React Frontend** (JavaScript, no TypeScript) with Inertia.js
- ✅ **Laravel Sanctum** token-based API authentication
- ✅ **Role-based access control** (ADMIN, ENGINEERING, MAINTENANCE, CONSUMER)
- ✅ **Role-specific dashboards** for each user type
- ✅ **Password change** functionality for all users
- ✅ Supabase PostgreSQL database support
- ✅ CORS enabled for API access
- ✅ No public self-registration — admin creates all accounts

---

## Default Login Credentials

> ⚠️ **Change these passwords immediately after first login!**

| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@watermaintenance.local` | `Admin123!` |
| ENGINEERING | `engineering@watermaintenance.local` | `Engineering123!` |

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

**Development (SQLite):**
```bash
touch database/database.sqlite
php artisan migrate
php artisan db:seed --class=AdminEngineeringSeeder
```

**Production (Supabase PostgreSQL) — update `.env`:**
```env
DB_CONNECTION=pgsql
DB_HOST=your-supabase-host.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
DB_SSLMODE=require
```
Then run:
```bash
php artisan migrate --force
php artisan db:seed --class=AdminEngineeringSeeder
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
app/Http/Controllers/Api/
├── Admin/
│   └── UserManagementController.php    # Admin user management
├── ComplaintController.php              # Complaint management
├── DashboardController.php              # Role-based dashboards
├── MaintenanceReportController.php      # Maintenance reports
├── UserController.php                   # Password change, profile
└── WorkOrderController.php              # Work order management

app/Http/Middleware/
├── RoleMiddleware.php                   # Role-based access control
├── AdminAccess.php
├── EngineeringAccess.php
└── MaintenanceAccess.php
```

### Frontend (React)
```
resources/js/pages/
├── Admin/
│   ├── Dashboard.jsx
│   ├── complaints/ComplaintsList.jsx
│   ├── reports/ReportsList.jsx
│   ├── users/UsersList.jsx
│   └── work-orders/WorkOrdersList.jsx
├── Engineering/
│   ├── Dashboard.jsx
│   └── approvals/ (PendingApprovals, ApprovedList, DeclinedList)
├── Maintenance/
│   ├── Dashboard.jsx
│   ├── reports/SubmitReport.jsx
│   └── tasks/ (AssignedTasks, TaskHistory)
└── Consumer/
    ├── Dashboard.jsx
    └── complaints/ (ComplaintsList, SubmitComplaintModal)
```

### Key Files
- `routes/api.php` — All API endpoint definitions
- `app/Http/Middleware/RoleMiddleware.php` — Role-based access control
- `database/seeders/AdminEngineeringSeeder.php` — Initial account creation
- `app/Models/User.php` — User model with roles enum

---

## User Roles & Permissions

### ADMIN
- ✅ Create and manage all users (including maintenance staff)
- ✅ View all complaints and work orders
- ✅ Assign work orders to maintenance staff
- ✅ Full system access

### ENGINEERING
- ✅ Review, approve, and decline complaints
- ✅ Monitor approved work orders
- ✅ View engineering dashboard

### MAINTENANCE
- ✅ View assigned work orders
- ✅ Start and complete work
- ✅ Submit maintenance reports
- ✅ View own work history

### CONSUMER
- ✅ Submit complaints
- ✅ View own complaint status
- ✅ Track work order progress

> All roles can change their own password at any time.

---

## Dashboard Features by Role

| Dashboard | Key Stats |
|-----------|-----------|
| **Admin** | Pending complaints, pending assignments, active work orders, total users |
| **Engineering** | Pending reviews, approved/declined this month, complaints table |
| **Maintenance** | Assigned work, completed this month, reports pending |
| **Consumer** | Total/pending/approved/completed complaints |

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/login` | User login |
| GET | `/api/v1/status` | API status |

### All Authenticated Users (Bearer Token required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Get authenticated user |
| GET | `/api/v1/dashboard` | Role-specific dashboard data |
| GET | `/api/v1/complaints` | Get complaints (filtered by role) |
| POST | `/api/v1/complaints` | Submit complaint (Consumer) |
| GET | `/api/v1/work-orders` | Get work orders (filtered by role) |
| GET | `/api/v1/maintenance-reports` | Get maintenance reports |
| POST | `/api/change-password` | Change own password |
| POST | `/api/logout` | Logout (revoke current token) |
| POST | `/api/logout-all` | Logout from all devices |

### Admin Only (`role:ADMIN`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List all users |
| POST | `/api/v1/admin/users` | Create new user/staff |
| GET | `/api/v1/admin/users/{id}` | Get specific user |
| PUT | `/api/v1/admin/users/{id}` | Update user |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| POST | `/api/v1/admin/users/{user}/role` | Update user role |
| GET | `/api/v1/admin/maintenance-staff` | List all maintenance workers |

### Engineering & Maintenance (`role:ENGINEERING,MAINTENANCE`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/maintenance/reports` | Access maintenance reports |

### Maintenance Only (`role:MAINTENANCE`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/maintenance/work-orders` | Create work orders |

---

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@watermaintenance.local",
    "password": "Admin123!"
  }'
```
**Response:**
```json
{
  "user": { "id": 1, "name": "Admin", "email": "admin@watermaintenance.local", "role": "ADMIN" },
  "token": "1|xxxxxxxxxxxxx",
  "token_type": "Bearer"
}
```

### Get User Profile
```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Change Password
```bash
curl -X POST http://localhost:8000/api/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "Admin123!",
    "new_password": "NewSecurePassword123!",
    "new_password_confirmation": "NewSecurePassword123!"
  }'
```

### Create a New Staff Account (Admin only)
```bash
curl -X POST http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Worker",
    "email": "john@maintenance.local",
    "password": "SecurePassword123!",
    "role": "MAINTENANCE"
  }'
```
Available roles: `ADMIN`, `ENGINEERING`, `MAINTENANCE`, `CONSUMER`

### Access Admin-Only Route
```bash
curl -X GET http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Access Denied Response (403)
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource",
  "required_roles": ["ADMIN"],
  "user_role": "CONSUMER"
}
```

### Logout
```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Features

- ✅ No public self-registration — admin creates all accounts
- ✅ Bearer token authentication (Laravel Sanctum)
- ✅ Role-based access control via middleware
- ✅ Password hashing with bcrypt
- ✅ Token revocation on logout
- ✅ API throttling (60 requests/minute)
- ✅ CORS configured for API access
- ✅ SQL injection protection via Eloquent ORM

---

## Production Configuration

```env
APP_ENV=production
APP_DEBUG=false
```

- Install PostgreSQL PHP extension: `apt-get install php-pgsql`
- Configure SSL connection for Supabase (`DB_SSLMODE=require`)
- Use HTTPS in production
- Never expose `.env` files
- Update `config/cors.php` with your production domain

---

## Development Commands

```bash
# Clear caches
php artisan config:clear && php artisan route:clear

# List all API routes
php artisan route:list --path=api

# Run tests
php artisan test

# Code formatting
./vendor/bin/pint

# Reset database and re-seed
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
php artisan migrate:fresh
php artisan db:seed --class=AdminEngineeringSeeder
```

**Token not working?**
- Include `Authorization: Bearer {token}` header in every request
- Check the token hasn't been revoked
- Login again to get a fresh token

**Check logs:**
```bash
# View latest application logs
cat storage/logs/laravel.log
```