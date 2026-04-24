@echo off
echo Formatting Backend...
cd backend
call vendor\bin\pint
cd ..

echo Formatting Frontend...
cd frontend
call npx prettier --write .
call npx eslint . --fix
cd ..

echo Done! Everything is beautiful.
