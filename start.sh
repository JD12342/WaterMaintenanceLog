#!/bin/bash
set -e

# Use PORT from environment or default to 8080
PORT=${PORT:-8080}

echo "Starting Laravel application on port $PORT..."

# Configure Apache to listen on dynamic PORT
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
rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* || true

# Ensure storage and cache directories exist with correct permissions
mkdir -p storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Build frontend assets if missing
if [ ! -f public/build/manifest.json ]; then
    echo "Building frontend assets..."
    npm run build
fi

# Start Apache in foreground
exec apache2-foreground
