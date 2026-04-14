@echo off
start cmd /k "cd backend && php artisan serve"
start cmd /k "cd frontend && npm run dev"