FROM php:8.5-fpm-alpine

# Build dependencies (compiler, autoconf, etc.) + runtime libs
RUN apk add --no-cache \
    # Compiler toolchain — required by docker-php-ext-install
    $PHPIZE_DEPS \
    # Utilities
    git \
    curl \
    zip \
    unzip \
    mysql-client \
    linux-headers \
    # GD dependencies
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    # Zip
    libzip-dev \
    # Mbstring
    oniguruma-dev \
    # Intl
    icu-dev \
    icu-libs

# Configure GD with jpeg + freetype + webp support
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp

# Install extensions — separated so each failure is identifiable
RUN docker-php-ext-install -j$(nproc) pdo_mysql
RUN docker-php-ext-install -j$(nproc) mbstring
RUN docker-php-ext-install -j$(nproc) exif
RUN docker-php-ext-install -j$(nproc) pcntl
RUN docker-php-ext-install -j$(nproc) bcmath
RUN docker-php-ext-install -j$(nproc) gd
RUN docker-php-ext-install -j$(nproc) zip
RUN docker-php-ext-install -j$(nproc) intl
# opcache is statically compiled into PHP 8.5 — configured via php.ini, no install/enable needed

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# PHP config
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/backend

# Non-root user
RUN addgroup -g 1000 -S www && adduser -u 1000 -S www -G www
USER www

EXPOSE 9000
CMD ["php-fpm"]
