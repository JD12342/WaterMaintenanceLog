#!/bin/bash
set -e

# Use PORT from environment or default to 8080
PORT=${PORT:-8080}

echo "=========================================="
echo "🚀 Starting Laravel Application"
echo "=========================================="
echo "Port: $PORT"
echo "Environment: $(echo $APP_ENV | cut -c1-20)"
echo "----------------------------------------"

# Verify critical files exist
if [ ! -f .env ]; then
    echo "⚠️  ERROR: .env file not found!"
    exit 1
fi

if [ ! -f public/index.php ]; then
    echo "⚠️  ERROR: public/index.php not found!"
    exit 1
fi

# Verify storage/logs exists and is writable
mkdir -p storage/logs bootstrap/cache
touch storage/logs/laravel.log 2>/dev/null || echo "⚠️  Warning: Cannot write to storage/logs"

# Set correct permissions (critical for Laravel)
echo "Setting file permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# Configure Apache to listen on dynamic PORT
echo "Configuring Apache for port $PORT..."
sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf

# Create Apache VirtualHost configuration
cat > /etc/apache2/sites-enabled/000-default.conf <<EOF
<VirtualHost *:$PORT>
    DocumentRoot /var/www/html/public
    <Directory /var/www/html/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF

# Fix Apache MPM modules
echo "Configuring Apache modules..."
rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* 2>/dev/null || true
a2enmod mpm_prefork 2>/dev/null || true

# Build frontend assets if missing
if [ ! -f public/build/manifest.json ]; then
    echo "Building frontend assets (this may take a minute)..."
    npm run build
fi

echo "----------------------------------------"
echo "✅ Laravel ready, starting Apache..."
echo "   Listen on: 0.0.0.0:$PORT"
echo "   Document root: /var/www/html/public"
echo "=========================================="
echo ""

# Show Laravel configuration
echo "📋 Laravel Configuration:"
php artisan about 2>/dev/null || echo "Note: php artisan about not available"
echo ""

# Start Apache in foreground with error logging
exec apache2-foreground 2>&1
