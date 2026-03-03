# Role-Based Authentication Test Examples

This document provides examples to test the new role-based authentication system.

## 1. Register Users with Different Roles

### Register an Admin User
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "ADMIN"
  }'
```

### Register a Maintenance User
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maintenance User",
    "email": "maintenance@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "MAINTENANCE"
  }'
```

### Register a Consumer User (Default Role)
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consumer User",
    "email": "consumer@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

## 2. Test Role-Protected Routes

### Login as Admin
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Access Admin-Only Route (Replace TOKEN with actual token)
```bash
curl -X GET http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Try Admin Route as Consumer (Should fail with 403)
```bash
curl -X GET http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_CONSUMER_TOKEN"
```

### Access Maintenance Reports (Engineering or Maintenance roles)
```bash
curl -X GET http://localhost:8000/api/v1/maintenance/reports \
  -H "Authorization: Bearer YOUR_MAINTENANCE_TOKEN"
```

### Create Work Order (Maintenance only)
```bash
curl -X POST http://localhost:8000/api/v1/maintenance/work-orders \
  -H "Authorization: Bearer YOUR_MAINTENANCE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 3. Available Role-Protected Routes

### Admin Only (`role:ADMIN`)
- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/users/{user}/role` - Update user role

### Engineering & Maintenance (`role:ENGINEERING,MAINTENANCE`)
- `GET /api/v1/maintenance/reports` - Access maintenance reports

### Maintenance Only (`role:MAINTENANCE`)
- `POST /api/v1/maintenance/work-orders` - Create work orders

### All Authenticated Users
- `GET /api/user` - Get current user info (includes role)
- `GET /api/v1/dashboard` - Dashboard access (shows user role)
- `POST /api/logout` - Logout current session
- `POST /api/logout-all` - Logout all sessions

## 4. Expected Response Format

### Success Response
```json
{
  "message": "Success message",
  "user_role": "ADMIN",
  "data": { ... }
}
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

## 5. Role Hierarchy

- **ADMIN**: Full access to all routes
- **ENGINEERING**: Access to technical reports and maintenance data
- **MAINTENANCE**: Can create work orders and access reports
- **CONSUMER**: Basic access to dashboard and user info only