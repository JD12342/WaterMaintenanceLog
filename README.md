# Laravel + React Water Maintenance System

This is a full-stack Laravel 12 project with **React frontend** and role-based authentication using **Laravel Sanctum**.

## Features

- ✅ **React Frontend** (JavaScript, no TypeScript)  
- ✅ **Laravel Sanctum API Authentication** (Token-based)
- ✅ **Role-based access control** (ADMIN, ENGINEERING, MAINTENANCE, CONSUMER)
- ✅ Supabase PostgreSQL database support
- ✅ CORS enabled for API access
- ✅ Production-ready configuration
- ✅ Complete authentication endpoints

## Setup

**Your Laravel server is already running on:** `http://127.0.0.1:8000`

**To get the React frontend working:**

1. **Install Node.js** from https://nodejs.org/ (LTS version)
2. **Install frontend dependencies:**
   ```bash
   npm install
   npm run dev
   ```
3. **Visit:** http://127.0.0.1:8000

## Setup

1. **Install dependencies:**
   ```bash
   composer install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database setup:**
   
   **For Development (SQLite):**
   ```bash
   # SQLite is already configured for development
   touch database/database.sqlite
   php artisan migrate
   ```

   **For Production (Supabase PostgreSQL):**
   ```bash
   # Update .env with your Supabase credentials:
   DB_CONNECTION=pgsql
   DB_HOST=your-supabase-host.supabase.co
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USERNAME=postgres
   DB_PASSWORD=your-supabase-password
   DB_SSLMODE=require
   
   # Then run migrations
   php artisan migrate
   ```

4. **Start the server:**
   ```bash
   php artisan serve
   ```

## Authentication API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/register` | User registration |
| POST | `/api/login` | User login |
| GET | `/api/v1/status` | API status |

### Protected Endpoints (Require Bearer Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Get authenticated user |
| POST | `/api/logout` | Logout (revoke current token) |
| POST | `/api/logout-all` | Logout from all devices |
| GET | `/api/v1/dashboard` | Protected dashboard route |

## API Usage Examples

### 1. Register a new user
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "1|tokenstring...",
  "token_type": "Bearer"
}
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Logout
```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Features

- **Token expiration**: Set to 1 year (configurable)
- **API throttling**: 60 requests per minute
- **CORS protection**: Configurable origins
- **CSRF protection**: Disabled for API routes
- **Password hashing**: Bcrypt with configurable rounds
- **SQL injection protection**: Eloquent ORM

## Production Configuration

### Environment Variables
```env
APP_ENV=production
APP_DEBUG=false
SANCTUM_TOKEN_PREFIX=myapp_
```

### Database Requirements
- Install PostgreSQL PHP extension: `apt-get install php-pgsql`
- Configure SSL connection for Supabase
- Run migrations: `php artisan migrate --force`

### Security Recommendations
1. **Set token expiration**: Configure `SANCTUM_TOKEN_PREFIX` 
2. **Configure CORS**: Update `config/cors.php` for production domains
3. **Use HTTPS**: Ensure SSL certificates in production
4. **Environment security**: Never expose `.env` files
5. **Rate limiting**: Configure per your requirements

## Development

- **Clear caches:** `php artisan config:clear && php artisan route:clear`
- **Check routes:** `php artisan route:list --path=api`
- **Run tests:** `php artisan test`
- **Code formatting:** `./vendor/bin/pint`

## Architecture Notes

- **API-only**: No blade views or frontend assets
- **Token authentication**: Stateless API using personal access tokens
- **RESTful design**: Following REST principles
- **Database agnostic**: Works with SQLite, PostgreSQL, MySQL
- **Middleware protected**: Routes properly secured