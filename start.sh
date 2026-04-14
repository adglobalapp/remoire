#!/bin/bash
(cd backend && php artisan serve) & (cd frontend && npm run dev)