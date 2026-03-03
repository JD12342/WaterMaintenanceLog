# Water Maintenance Log System - Setup Complete! ✓

## 🎉 System is Ready to Use

Your water maintenance management system is now fully configured with:
- ✅ Admin and Engineering accounts created
- ✅ Role-based dashboards (Admin, Engineering, Maintenance, Consumer)
- ✅ Password change functionality for all users
- ✅ Organized file structure with controllers in proper folders
- ✅ Secure authentication with Laravel Sanctum

---

## 🔐 Default Login Credentials

### Admin Account
- **Email**: `admin@watermaintenance.local`
- **Password**: `Admin123!`
- **Role**: ADMIN

### Engineering Account
- **Email**: `engineering@watermaintenance.local`
- **Password**: `Engineering123!`
- **Role**: ENGINEERING

⚠️ **IMPORTANT**: Change these passwords immediately after first login!

---

## 🚀 Quick Start

### Starting the Server
```bash
cd c:\Users\jd29n\OneDrive\Desktop\WATERMAINTENANCELOG\wmls
php artisan serve
```

Server will run at: `http://127.0.0.1:8000`

---

## 📂 File Structure

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
```

### Frontend (React)
```
resources/js/pages/
├── Admin/
│   └── Dashboard.jsx                    # Admin dashboard
├── Engineering/
│   └── Dashboard.jsx                    # Engineering dashboard
├── Maintenance/
│   └── Dashboard.jsx                    # Maintenance worker dashboard
└── Consumer/
    └── Dashboard.jsx                    # Consumer dashboard
```

---

## 🔑 API Authentication Endpoints

### Login
```bash
POST /api/login
Content-Type: application/json

{
  "email": "admin@watermaintenance.local",
  "password": "Admin123!"
}

Response:
{
  "user": {...},
  "token": "1|xxxxxxxxxxxxx",
  "token_type": "Bearer"
}
```

### Get User Profile
```bash
GET /api/user
Authorization: Bearer {your_token}
```

### Change Password
```bash
POST /api/change-password
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "current_password": "Admin123!",
  "new_password": "NewSecurePassword123!",
  "new_password_confirmation": "NewSecurePassword123!"
}
```

### Logout
```bash
POST /api/logout
Authorization: Bearer {your_token}
```

---

## 🎯 API Endpoints by Role

### Admin Only (`/api/v1/admin/`)
- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/users` - Create new user/staff
- `GET /api/v1/admin/users/{id}` - Get specific user
- `PUT /api/v1/admin/users/{id}` - Update user details
- `DELETE /api/v1/admin/users/{id}` - Delete user
- `GET /api/v1/admin/maintenance-staff` - Get all maintenance workers

### All Authenticated Users
- `GET /api/v1/dashboard` - Get role-specific dashboard data
- `GET /api/v1/complaints` - Get complaints (filtered by role)
- `POST /api/v1/complaints` - Submit complaint (Consumer)
- `GET /api/v1/work-orders` - Get work orders (filtered by role)
- `GET /api/v1/maintenance-reports` - Get maintenance reports

---

## 👥 User Roles & Permissions

### ADMIN
- ✅ Create/manage all users including maintenance staff
- ✅ View all complaints and work orders
- ✅ Assign work orders to maintenance staff
- ✅ Full system access
- ✅ Change password anytime

### ENGINEERING
- ✅ Review and approve/decline complaints
- ✅ View engineering dashboard
- ✅ Monitor approved work orders
- ✅ Change password anytime

### MAINTENANCE
- ✅ View assigned work orders
- ✅ Start and complete work
- ✅ Submit maintenance reports
- ✅ View own work history
- ✅ Change password anytime

### CONSUMER
- ✅ Submit complaints
- ✅ View own complaints status
- ✅ Track work order progress
- ✅ Change password anytime

---

## 🔧 Creating New Users (Admin Only)

### Via API
```bash
POST /api/v1/admin/users
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "John Maintenance Worker",
  "email": "john@maintenance.local",
  "password": "SecurePassword123!",
  "role": "MAINTENANCE"
}
```

Available roles: `ADMIN`, `ENGINEERING`, `MAINTENANCE`, `CONSUMER`

### Via Admin Dashboard (Frontend)
1. Login as admin
2. Navigate to "Add New User/Staff" button
3. Fill in the form with name, email, password, and role
4. Submit the form

---

## 🛠️ Common Tasks

### Add a Maintenance Worker
1. Login as Admin
2. Use `POST /api/v1/admin/users` with role: "MAINTENANCE"
3. Provide worker with their email and temporary password
4. Worker can change password on first login

### Change Your Password
1. Login with current credentials
2. Use `POST /api/change-password` endpoint
3. Provide current password and new password (must be confirmed)

### View Dashboard Data
```bash
GET /api/v1/dashboard
Authorization: Bearer {your_token}
```
Returns role-specific data automatically based on your account type.

---

## 🔒 Security Features

- ✅ No public registration (admin creates all accounts)
- ✅ Bearer token authentication
- ✅ Role-based access control (middleware)
- ✅ Password hashing with bcrypt
- ✅ Password change functionality for all users
- ✅ Token revocation on logout
- ✅ CORS configured for API access

---

## 📊 Dashboard Features by Role

### Admin Dashboard
- Pending complaints count
- Pending assignments count
- Active work orders count
- Total users count
- Recent complaints table
- Active work orders table

### Engineering Dashboard
- Pending reviews count
- Approved this month count
- Declined this month count
- Complaints pending review table
- Recently approved table

### Maintenance Dashboard
- Assigned work count
- Completed this month count
- Reports pending count
- Active work orders table
- Recently completed table

### Consumer Dashboard
- Total complaints count
- Pending complaints
- Approved complaints
- Completed complaints
- My complaints table with status tracking

---

## 📁 Important Files

- `routes/api.php` - All API endpoint definitions
- `app/Http/Middleware/RoleMiddleware.php` - Role-based access control
- `database/seeders/AdminEngineeringSeeder.php` - Initial account creation
- `app/Models/User.php` - User model with roles enum
- `app/Http/Controllers/Api/DashboardController.php` - Dashboard logic

---

## 🐛 Troubleshooting

### Server not starting?
```bash
php artisan config:clear
php artisan route:clear
php artisan serve
```

### Database issues?
```bash
php artisan migrate:fresh
php artisan db:seed --class=AdminEngineeringSeeder
```

### Token not working?
- Ensure you're including `Authorization: Bearer {token}` header
- Check token hasn't expired or been revoked
- Try logging in again to get a fresh token

---

## 📞 Support

For additional help:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Review API errors in browser console
3. Test endpoints with tools like Postman or curl

---

**System Version**: 1.0  
**Last Updated**: March 4, 2026  
**Status**: ✅ Ready for Production Use
