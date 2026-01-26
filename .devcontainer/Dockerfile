FROM wordpress:php8.3-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    mariadb-client \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (Latest LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g firebase-tools

# Install WP-CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

# Install Composer 2.5.8 (matching remote environment)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --version=2.5.8 \
    && chmod +x /usr/local/bin/composer

# Configure PHP settings for development (optional but recommended)
RUN echo "file_uploads = On\n" \
         "memory_limit = 512M\n" \
         "upload_max_filesize = 128M\n" \
         "post_max_size = 128M\n" \
         "max_execution_time = 600\n" \
         > /usr/local/etc/php/conf.d/uploads.ini

# Change www-data shell to bash for Dev Container
RUN usermod -s /bin/bash www-data
