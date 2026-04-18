#!/bin/bash
cd backend && cp .env.example .env && composer install && php artisan key:generate && touch database/database.sqlite && php artisan migrate --force && php artisan storage:link
cd ../frontend && cp .env.example .env && npm install
