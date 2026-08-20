# BuildWise

Construction Services Management System (CSMS) built with Laravel, Inertia.js,
React, TypeScript, Tailwind CSS, and MySQL/MariaDB.

## Requirements

- PHP 8.3 or newer
- Composer
- Node.js and npm
- XAMPP MySQL/MariaDB
- Git

## Installation

Clone the repository and enter the project folder:

```powershell
git clone https://github.com/Jush342/BuildWise.git
cd BuildWise
```

Install the backend and frontend dependencies:

```powershell
composer install
npm install
```

Create the local environment file and application key:

```powershell
copy .env.example .env
php artisan key:generate
```

## Database Setup

Start MySQL/MariaDB from XAMPP, then create a database named `csms` in
phpMyAdmin or MySQL.

Update the database section in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=csms
DB_USERNAME=root
DB_PASSWORD=
```

Run the migrations:

```powershell
php artisan migrate
```

Check the database connection and migration status with:

```powershell
php artisan config:clear
php artisan migrate:status
```

## Running the Application

Use two terminals from the project folder.

Terminal 1, start Laravel:

```powershell
php artisan serve
```

Terminal 2, start the frontend asset server:

```powershell
npm run dev
```

Open the application at:

```text
http://localhost:8000
```

Alternatively, run the backend, queue worker, and frontend together:

```powershell
composer run dev
```

## Current CSMS Modules

- Dashboard foundation
- Client profile CRUD
- Service and hourly-rate CRUD
- Team-scoped data access
- Booking creation
- Multiple services per booking
- Server-side charge calculation
- Overlapping schedule validation
- Automatic invoice generation
- Billing transaction database structure
- Payment database structure
- Inventory database structure

## Project Structure

### Backend

| Location | Purpose |
| --- | --- |
| `routes/web.php` | Application URLs and route-to-controller mapping |
| `app/Http/Controllers` | Backend actions for pages and form submissions |
| `app/Http/Requests` | Validation rules for submitted forms |
| `app/Models` | Eloquent database models and relationships |
| `app/Policies` | Authorization and team access rules |
| `database/migrations` | Database table definitions |
| `database/factories` | Test data factories |
| `config` | Laravel application configuration |
| `.env` | Local environment and database configuration |

### Frontend

| Location | Purpose |
| --- | --- |
| `resources/js/app.tsx` | Inertia and React application entry point |
| `resources/js/pages` | Inertia React pages |
| `resources/js/components` | Reusable React components |
| `resources/js/layouts` | Shared page layouts |
| `resources/css/app.css` | Global Tailwind CSS theme and styles |
| `resources/js/routes` | Generated Wayfinder route helpers |
| `vite.config.ts` | Vite, React, Tailwind, Inertia, and Wayfinder setup |

## Following a Feature

Most features follow this path:

```text
Route
	-> Controller
	-> Form Request validation
	-> Model and database
	-> Inertia props
	-> React page
```

For example, booking code is located in:

- `routes/web.php`
- `app/Http/Controllers/Bookings/BookingController.php`
- `app/Http/Requests/Bookings/SaveBookingRequest.php`
- `app/Models/Booking.php`
- `resources/js/pages/bookings/index.tsx`

## Useful Commands

Backend:

```powershell
php artisan route:list
php artisan migrate:status
php artisan test --compact
vendor/bin/pint --format agent
```

Frontend:

```powershell
npm run build
npm run types:check
npm run lint:check
npm run format:check
```

Regenerate typed frontend routes after changing backend routes:

```powershell
php artisan wayfinder:generate --with-form --no-interaction
```

## Testing

Feature tests are located in `tests/Feature`. Current CSMS tests cover:

- Client rendering, creation, validation, and team isolation
- Service rendering, creation, validation, and team isolation
- Booking totals, invoice creation, and overlapping schedule validation

Run the focused CSMS tests with:

```powershell
php artisan test --compact tests/Feature/Clients/ClientTest.php tests/Feature/Services/ServiceTest.php tests/Feature/Bookings/BookingTest.php
```

## Development Roadmap

- Payment processing interface
- Inventory CRUD interface
- Billing and invoice management pages
- Dashboard analytics and charts
- Revenue and service reports
- Weekly calendar schedule
- Search and filtering
- Responsive UI polish
