FROM php:8.2-apache

# Ensure only mpm_prefork is enabled (required for Apache with PHP)
RUN a2dismod mpm_event mpm_worker || true && a2enmod mpm_prefork

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Install Node.js for npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install PHP and Node dependencies
RUN composer install --no-interaction --prefer-dist \
    && npm install \
    && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Enable rewrite module
RUN a2enmod rewrite

# Remove default config and create new one
RUN rm -f /etc/apache2/sites-enabled/000-default.conf

# Create Laravel Apache configuration
RUN echo '<VirtualHost *:80>' > /etc/apache2/sites-enabled/000-default.conf && \
    echo '  ServerName _' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '  DocumentRoot /var/www/html/public' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '  <Directory /var/www/html/public>' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '    Options Indexes FollowSymLinks' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '    AllowOverride All' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '    Require all granted' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '    <IfModule mod_rewrite.c>' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '      RewriteEngine On' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '      RewriteCond %{REQUEST_FILENAME} !-d' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '      RewriteCond %{REQUEST_FILENAME} !-f' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '      RewriteRule ^ index.php [QSA,L]' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '    </IfModule>' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '  </Directory>' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '</VirtualHost>' >> /etc/apache2/sites-enabled/000-default.conf

# Generate app key
RUN php artisan key:generate || true

# Clear caches
RUN php artisan config:clear || true

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
