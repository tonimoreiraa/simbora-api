# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Simbora API**, an AdonisJS v6 e-commerce backend API built with TypeScript. It provides endpoints for managing products, orders, users, and related e-commerce functionality with PostgreSQL as the database.

## Development Commands

### Essential Commands

- `pnpm dev` - Start development server with hot module reloading
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run all tests using Japa
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier

### Database Commands

- `pnpm migrate` - Run database migrations
- `pnpm seed` - Run database seeders
- `node ace migration:make <name>` - Create new migration
- `node ace db:seed` - Seed database

### Development Environment

- `make docker-dev-start` - Start PostgreSQL and pgAdmin containers
- `make docker-dev-stop` - Stop development containers
- PostgreSQL runs on port 5432, pgAdmin on port 7076

## Architecture

### Framework & Core

- **AdonisJS v6** with TypeScript and ES modules
- **Lucid ORM** for database operations
- **Vine.js** for request validation
- **PostgreSQL** database with full migration system

### Import Aliases

The project uses path aliases defined in package.json:

- `#controllers/*` → `./app/controllers/*.js`
- `#models/*` → `./app/models/*.js`
- `#services/*` → `./app/services/*.js`
- `#validators/*` → `./app/validators/*.js`
- `#middleware/*` → `./app/middleware/*.js`
- `#config/*` → `./config/*.js`

### Key Directories

- `app/controllers/` - HTTP request handlers
- `app/models/` - Lucid ORM models with relationships
- `app/middleware/` - Request middleware (auth, CORS, etc.)
- `app/validators/` - Vine.js validation schemas
- `start/routes.ts` - Route definitions with middleware groups
- `database/migrations/` - Database schema migrations
- `config/` - Application configuration files

### Authentication

- Uses AdonisJS Auth with access tokens
- Database token provider (`DbAccessTokensProvider`)
- Role-based access: 'customer', 'admin', 'professional', 'supplier'
- Protected routes grouped under `middleware.auth()`

### API Documentation

- Swagger/OpenAPI documentation available at `/docs`
- OpenAPI JSON spec at `/openapi`
- Configured via `config/swagger.ts`

### Core Models & Relationships

- **User** - Has many addresses, orders, suppliers
- **Product** - Belongs to category, has variants and images
- **Order** - Belongs to user, has items, payments, shipping, updates
- **ProductVariant** - Belongs to product and variant type
- **Category** - Has many products

### File Uploads

- Static file serving at `/uploads/:file` route
- Files stored in `tmp/uploads/` directory
- Avatar URLs automatically prefixed with PUBLIC_URL

## Testing

- **Japa** test runner with two suites:
  - Unit tests: `tests/unit/**/*.spec(.ts|.js)` (2s timeout)
  - Functional tests: `tests/functional/**/*.spec(.ts|.js)` (30s timeout)

## Code Quality

- ESLint with AdonisJS config
- Prettier with AdonisJS config
- Commitizen for conventional commits (`pnpm commit`)
- TypeScript strict mode enabled
