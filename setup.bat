cd backend
copy .env.example .env
call composer install
call php artisan key:generate
copy /y nul database\database.sqlite
call php artisan migrate --force
cd ../frontend
copy .env.example .env
call npm install
