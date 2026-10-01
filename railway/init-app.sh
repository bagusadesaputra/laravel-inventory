#!/bin/bash
# Runs before each Railway deployment starts. Keep it idempotent: this fires
# on every deploy, not just the first one.
#
# `chmod +x` is done by the Pre-Deploy Command itself, so this only needs set -e.
set -e

# Schema
php artisan migrate --force

# One known admin account (no-op once it exists)
php artisan db:seed --class=AdminUserSeeder --force

# Start from a clean slate, then bake the runtime config for the new build
php artisan optimize:clear
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache
