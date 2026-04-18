# Remoire - Backend

The robust API powering the Remoire platform, built with Laravel. This service manages user authentication, journal entries, relationship logic, and timeline data.

## 🚀 Features

- **Authentication**: Secure user registration and login via Sanctum.
- **Relationship Management**: Sophisticated relationship tracking between users.
- **Entry System**: Full CRUD for journal entries and quick notes.
- **Timeline API**: Efficient data retrieval for interactive timeline views.
- **Database Architecture**: Optimized schema for rich text content and media references.

## 🛠️ Tech Stack

- **Framework**: [Laravel](https://laravel.com/) (PHP)
- **Database**: MySQL / SQLite (configurable via .env)
- **ORM**: Eloquent
- **Authentication**: Laravel Sanctum

## 🏁 Getting Started

1. **Install dependencies**:
   ```bash
   composer install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Run Migrations & Seeders**:
   ```bash
   php artisan migrate:fresh --seed
   ```

4. **Start Development Server**:
   ```bash
   php artisan serve
   ```
