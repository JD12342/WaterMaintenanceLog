FROM php:8.2-apache

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

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Configure Apache for Laravel
RUN echo '<Directory /var/www/html/public>' > /etc/apache2/sites-enabled/000-default.conf && \
    echo '  AllowOverride All' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '  Allow from all' >> /etc/apache2/sites-enabled/000-default.conf && \
    echo '</Directory>' >> /etc/apache2/sites-enabled/000-default.conf

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -i "s|/var/www/html|${APACHE_DOCUMENT_ROOT}|g" /etc/apache2/sites-enabled/000-default.conf

# Generate app key and cache config
RUN php artisan key:generate || true

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
