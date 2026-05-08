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

# FIX APACHE MPM
RUN a2dismod mpm_event mpm_worker || true && \
    rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* && \
    a2enmod mpm_prefork rewrite

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

# Laravel permissions
RUN mkdir -p storage/logs bootstrap/cache /var/data && \
    chmod -R 775 storage bootstrap/cache /var/data && \
    chown -R www-data:www-data storage bootstrap/cache /var/data

# Copy and set up startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Apache config - will be dynamically configured for PORT
RUN rm -f /etc/apache2/sites-enabled/000-default.conf && \
    a2enmod rewrite ssl

# Laravel cache cleanup
RUN php artisan config:clear || true && \
    php artisan cache:clear || true

# Add trusted proxies for HTTPS behind Render
RUN echo "TRUSTED_PROXIES='*'" >> .env.production

EXPOSE 8080

ENTRYPOINT ["/start.sh"]
