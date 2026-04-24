#!/bin/bash
echo "Formatting Backend..."
cd backend && ./vendor/bin/pint
cd ..

echo "Formatting Frontend..."
cd frontend && npx prettier --write . && npx eslint . --fix
cd ..

echo "Done! Everything is beautiful."
