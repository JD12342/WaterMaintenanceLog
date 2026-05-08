FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev \
    gnupg \
    && docker-php-ext-install pdo pdo_pgsql

# FIX APACHE MPM and enable required modules
RUN a2dismod mpm_event mpm_worker || true && \
    rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* && \
    a2enmod mpm_prefork rewrite ssl headers && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set working directory
WORKDIR /var/www/html

# Copy files
COPY . .

# Set environment for build
ENV APP_ENV=production
ENV APP_URL=https://watermaintenancelog.onrender.com
ENV APP_DEBUG=false

# Install dependencies
RUN composer install --no-interaction --prefer-dist

# Install and build frontend
RUN npm ci && \
    npm run build

# Set Apache document root to /public (CRITICAL for Laravel)
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Laravel permissions - MUST be writable
RUN mkdir -p storage/logs bootstrap/cache && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 775 storage bootstrap/cache && \
    find storage bootstrap/cache -type f -exec chmod 644 {} \; && \
    find storage bootstrap/cache -type d -exec chmod 755 {} \;

# Copy and set up startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Laravel cache cleanup
RUN php artisan config:clear || true && \
    php artisan cache:clear || true

# Add trusted proxies for HTTPS behind Render
RUN echo "TRUSTED_PROXIES='*'" >> .env.production

EXPOSE 8080

ENTRYPOINT ["/start.sh"]
