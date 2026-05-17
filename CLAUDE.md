# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Shop Management System API** — A NestJS backend for managing shops, products, customers, orders, inventory, and suppliers. Built with TypeScript, MongoDB (Mongoose), JWT authentication, and Cloudinary for media storage.

## Architecture

The codebase follows a modular, feature-based structure:

```
src/
├── api/                    # Feature modules (shop, customer, products, orders, etc.)
│   ├── api.module.ts      # Imports all feature modules
│   ├── customer/          # Customer management module
│   ├── orders/            # Order management module
│   ├── products/          # Product catalog module
│   ├── shop/              # Shop configuration & stats
│   ├── supplier/          # Supplier management
│   ├── inventory/         # Inventory tracking
│   ├── form/              # Form management
│   ├── gst/               # GST (tax) management
│   ├── media-storage/     # Cloudinary integration
│   └── user/              # User authentication & management
├── shared/                # Reusable utilities and configuration
│   ├── config/            # ConfigService loaders for env variables
│   ├── core/              # Base classes and core utilities
│   ├── decorator/         # Custom decorators (@Roles, @User, etc.)
│   ├── gaurd/             # Authentication & authorization guards (auth, roles)
│   ├── pipes/             # NestJS validation pipes
│   ├── schema/            # Shared Mongoose schemas
│   ├── dto/               # Shared DTOs
│   ├── enum/              # Shared enums
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Helper functions
├── scripts/               # Utility scripts
├── app.module.ts          # Root module with global config
└── main.ts                # Bootstrap with Swagger, CORS, versioning
```

### Module Pattern

Each API module (e.g., `api/shop/`) follows this structure:
- `{name}.module.ts` — Imports schemas, controllers, services, and dependencies
- `{name}.controller.ts` — HTTP routes and request handling
- `{name}.service.ts` — Business logic and data transformation
- `repository/{name}.repository.ts` — Mongoose query abstraction
- `schema/{name}.schema.ts` — Mongoose schema definitions
- `dto/` — Data transfer objects for request/response validation
- `enum/` — Domain-specific enums

### Path Aliases

TypeScript paths are configured in `tsconfig.json` for cleaner imports:
- `@api/*` → `src/api/*`
- `@shared/*` → `src/shared/*`
- `@config/*` → `src/shared/config/*`
- `@guards/*` → `src/shared/guards/*` (note: directory is `gaurd/`)
- `@core/*` → `src/shared/core/*`
- `@test/*` → `test/*`
- `@root/*` → `src/*`

## Development Commands

```bash
# Install dependencies
npm install

# Development server (with hot reload)
npm run start:dev

# Production build and run
npm run build && npm run start:prod

# Linting (fixes issues in place)
npm run lint

# Code formatting (Prettier)
npm run format

# Tests
npm run test              # Unit tests (files ending in .spec.ts)
npm run test:watch      # Watch mode for development
npm run test:cov        # Coverage report
npm run test:debug      # Debug mode for individual test investigation
npm run test:e2e        # E2E tests (test/jest-e2e.json config)

# Run a single test file
npm run test -- src/api/shop/shop.service.spec.ts

# Run tests matching a pattern
npm run test -- --testNamePattern="Shop"
```

## Authentication & Authorization

Global guards applied in `app.module.ts`:
- **AuthGuard** — Validates JWT tokens from `Authorization: Bearer <token>` headers
- **RolesGuard** — Restricts endpoints based on `@Roles()` decorator

Use `@Roles('admin')` or `@Roles('user')` on controllers/routes to enforce role checks.

The `@User()` decorator extracts the authenticated user object from the request.

## Configuration

Environment variables are loaded via ConfigService in `src/shared/config/`:
- `database.config.ts` — MongoDB connection settings
- `user.config.ts` — JWT secret, token expiration, password hashing
- `cloudinary.config.ts` — Media storage credentials
- `gst.config.ts` — Tax-related configuration

Copy `.env.default` to `.env` and fill in your secrets. See `.env.default` for all required variables.

## Key Features

- **URI Versioning** — Endpoints prefixed with `/api/v{N}` (configured in `main.ts`)
- **Swagger API Documentation** — Available at `/docs` with JWT auth scheme
- **Global Validation** — DTOs validated with `class-validator` and `class-transformer`
- **CORS** — Allows localhost and Vercel preview deployments; configurable via `FRONTEND_URL`
- **MongoDB Integration** — Mongoose with async repository pattern
- **Cloudinary** — Media upload and storage via `MediaStorageModule`

## Testing Notes

- Unit tests live alongside source files (`.spec.ts`)
- Jest config in `package.json` scans `src/**/*.spec.ts`
- Use `@nestjs/testing` utilities for mocking modules and services
- E2E tests use a separate config (`test/jest-e2e.json`)

## Common Patterns

- **DTOs**: Use `class-validator` decorators for validation and `class-transformer` for serialization
- **Services**: Lean on repositories for database queries; services handle business logic
- **Error Handling**: NestJS exceptions (`BadRequestException`, `NotFoundException`, etc.)
- **Enums**: Domain enums in module folders (e.g., `shop/enum/shop-status.enum.ts`)

## Development Notes

- `strictNullChecks: false` — Be aware of loose null checking in TypeScript compilation
- `@SkipAuth()` decorator exists for public endpoints (check `shared/decorator/`)
- Database logger level set via `MONGO_LOGGER_LEVEL` (default: `info`)
- ESLint + Prettier configured; `npm run lint` fixes automatically
