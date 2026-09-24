# ALA Auto Parts — NHTSA vPIC Vehicle Database & Integration Architecture

> **Official Integration Specification Document**  
> **Target Stack**: Laravel 11 (PHP 8.2+) · PostgreSQL · React Native Expo · React / Vite Admin  
> **Authoritative External Source**: NHTSA vPIC API (`https://vpic.nhtsa.dot.gov/api/`)

---

## 1. Executive Summary & Core Principles

The ALA Auto Parts platform requires a robust, scalable, and resilient vehicle database to facilitate accurate spare parts compatibility search and personal garage management ("كراج سياراتي").

### Core Architectural Rules:
1. **Database-First Strategy**: The React Native Mobile App **NEVER** calls `vpic.nhtsa.dot.gov` directly. All client requests target Laravel API endpoints (`/api/v1/vehicles/...`).
2. **PostgreSQL as Primary Ground Truth**: Vehicle data is persisted in PostgreSQL with normalized bilingual support (`name_en`, `name_ar`) and search aliases.
3. **NHTSA vPIC as Secondary External Source**: If a requested entity is missing locally, Laravel queries NHTSA vPIC, normalizes and persists the data, and returns the unified ALA schema. If NHTSA is unreachable or rate-limited, local PostgreSQL and cache continue serving the app without disruption.
4. **NHTSA vPIC is NOT a Parts Catalog**: NHTSA provides vehicle manufacturer and specification data. It does not provide spare parts, OEM numbers, pricing, part photos, or brand logos. Compatibility is strictly managed by ALA internal entities (`product_vehicle_compatibilities`).
5. **No Forced Specifications**: During mobile vehicle selection (Make $\rightarrow$ Model $\rightarrow$ Year $\rightarrow$ Save), engine specification is **strictly optional**. The user can save their vehicle immediately even if engine data is unavailable.

---

## 2. High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   React Native Expo                    │
│             (Vehicle Wizard & My Garage)               │
└───────────────────────────┬────────────────────────────┘
                            │  GET /api/v1/vehicles/...
                            │  POST /api/v1/me/vehicles
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Laravel Backend API                  │
│                                                        │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │ VehicleController     │   │ GarageController     │  │
│  └───────────┬───────────┘   └──────────┬───────────┘  │
│              │                          │              │
│              ▼                          ▼              │
│  ┌──────────────────────────────────────────────────┐  │
│  │      VehicleService / VehicleSyncService         │  │
│  │    (Cache Layer: Redis / File - 7 Days TTL)      │  │
│  └───────────┬──────────────────────────┬───────────┘  │
└──────────────┼──────────────────────────┼──────────────┘
               │                          │
      Database-First Fallback             │ On Missing Entity / Lazy Sync
               ▼                          ▼
┌───────────────────────────┐   ┌────────────────────────┐
│    PostgreSQL Database    │   │     NHTSA vPIC API     │
│                           │   │  (External Government) │
│ - vehicle_makes           │   │                        │
│ - vehicle_models          │   │ - GetAllMakes          │
│ - vehicle_model_years     │   │ - GetModelsForMakeIdYr │
│ - vehicle_specs           │   │ - DecodeVinValues      │
│ - user_vehicles           │   └────────────────────────┘
│ - vehicle_aliases         │
│ - compatibilities         │
└───────────────────────────┘
```

---

## 3. NHTSA vPIC Official Endpoints Used

Laravel's `App\Services\NhtsaVehicleService` uses official REST endpoints returning JSON:

| Operation | NHTSA Endpoint | Purpose in ALA |
| :--- | :--- | :--- |
| **All Vehicle Makes** | `GET /vehicles/GetAllMakes?format=json` | Base catalog of world vehicle manufacturers. Filtered locally for passenger cars/trucks. |
| **Models for Make & Year** | `GET /vehicles/GetModelsForMakeIdYear/makeId/{id}/modelyear/{year}?format=json` | High-precision model query for a given year. |
| **Models by Make ID** | `GET /vehicles/GetModelsForMakeId/{id}?format=json` | General model list for a manufacturer. |
| **VIN Decoder** | `GET /vehicles/DecodeVinValues/{vin}?format=json` | Future-ready VIN decoder extracting Make, Model, Year, Trim, Engine Cylinders, Displacement, and Drive Type. |

---

## 4. PostgreSQL Database Schema

The database migration is registered under `backend/database/migrations/2026_09_20_000002_create_vehicle_database_tables.php` and raw SQL `docs/data/migrations/2026_09_20_000002_create_vehicle_database_tables.sql`:

### 4.1. `vehicle_makes`
- `id` (BIGSERIAL PRIMARY KEY)
- `nhtsa_make_id` (INTEGER UNIQUE NULLABLE)
- `name_en` (VARCHAR 100 NOT NULL)
- `name_ar` (VARCHAR 100 NULLABLE)
- `slug` (VARCHAR 120 UNIQUE NOT NULL)
- `vehicle_type` (VARCHAR 60 DEFAULT 'Passenger Car')
- `logo_url` (VARCHAR 255 NULLABLE)
- `country_id` (INTEGER NULLABLE)
- `is_active` (BOOLEAN DEFAULT TRUE)
- `source` (`nhtsa` | `manual` | `other`)
- `source_updated_at`, `created_at`, `updated_at`

### 4.2. `vehicle_models`
- `id` (BIGSERIAL PRIMARY KEY)
- `make_id` (BIGINT REFERENCES `vehicle_makes(id)` ON DELETE CASCADE)
- `nhtsa_model_id` (INTEGER NULLABLE)
- `name_en` (VARCHAR 100 NOT NULL)
- `name_ar` (VARCHAR 100 NULLABLE)
- `slug` (VARCHAR 120 NOT NULL)
- `vehicle_type` (VARCHAR 60 NULLABLE)
- `is_active` (BOOLEAN DEFAULT TRUE)
- `source` (`nhtsa` | `manual` | `other`)
- `source_updated_at`, `created_at`, `updated_at`

### 4.3. `vehicle_model_years`
- `id` (BIGSERIAL PRIMARY KEY)
- `model_id` (BIGINT REFERENCES `vehicle_models(id)` ON DELETE CASCADE)
- `year` (INTEGER NOT NULL)
- `source` (`nhtsa` | `manual`)
- UNIQUE (`model_id`, `year`)

### 4.4. `vehicle_specs`
- `id` (BIGSERIAL PRIMARY KEY)
- `model_id` (BIGINT REFERENCES `vehicle_models(id)` ON DELETE CASCADE)
- `year_id` (BIGINT NULLABLE REFERENCES `vehicle_model_years(id)`)
- `make_id` (BIGINT REFERENCES `vehicle_makes(id)`)
- `model_name` (VARCHAR 100)
- `model_year` (INTEGER)
- `trim`, `series`, `body_class`, `vehicle_type` (VARCHAR NULLABLE)
- `doors`, `engine_cylinders`, `engine_displacement_cc`, `engine_hp` (INTEGER NULLABLE)
- `fuel_type`, `drive_type`, `transmission_style`, `transmission_speeds` (VARCHAR NULLABLE)
- `electrification_level` (VARCHAR NULLABLE)
- `raw_data` (JSONB NULLABLE)
- `source` (`nhtsa` | `manual`), `created_at`, `updated_at`

### 4.5. `user_vehicles` (User Garage)
- `id` (BIGSERIAL PRIMARY KEY)
- `user_id` (BIGINT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE)
- `make_id` (BIGINT NOT NULL REFERENCES `vehicle_makes(id)`)
- `model_id` (BIGINT NOT NULL REFERENCES `vehicle_models(id)`)
- `year_id` (BIGINT NULLABLE REFERENCES `vehicle_model_years(id)`)
- `vehicle_spec_id` (BIGINT NULLABLE REFERENCES `vehicle_specs(id)`)
- `nickname` (VARCHAR 80 NULLABLE)
- `vin` (VARCHAR 17 NULLABLE)
- `is_default` (BOOLEAN DEFAULT FALSE)
- `created_at`, `updated_at`

### 4.6. `vehicle_aliases`
- `id` (BIGSERIAL PRIMARY KEY)
- `entity_type` (`make` | `model`)
- `entity_id` (BIGINT NOT NULL)
- `language` (`ar` | `en`)
- `alias` (VARCHAR 120 NOT NULL)
- `normalized_alias` (VARCHAR 120 NOT NULL)

### 4.7. `product_vehicle_compatibilities`
- `id` (BIGSERIAL PRIMARY KEY)
- `product_id` (BIGINT NOT NULL REFERENCES `products(id)` ON DELETE CASCADE)
- `make_id` (BIGINT NOT NULL REFERENCES `vehicle_makes(id)`)
- `model_id` (BIGINT NOT NULL REFERENCES `vehicle_models(id)`)
- `year_from` (INTEGER NOT NULL)
- `year_to` (INTEGER NOT NULL)
- `engine_code`, `engine_name`, `notes` (VARCHAR NULLABLE)

### 4.8. `vehicle_sync_logs`
- `id` (BIGSERIAL PRIMARY KEY)
- `type` (VARCHAR 60 NOT NULL)
- `status` (`pending` | `running` | `completed` | `failed`)
- `records_processed`, `records_created`, `records_updated`, `records_failed` (INTEGER DEFAULT 0)
- `started_at`, `finished_at` (TIMESTAMP NULLABLE)
- `error_message` (TEXT NULLABLE)

---

## 5. Caching Strategy

All external vehicle responses and database queries are cached using Laravel's Cache Facade:

| Cache Key Pattern | TTL | Invalidation Trigger |
| :--- | :--- | :--- |
| `vehicle:makes` | 7 Days (604,800 s) | Admin add/edit make, or NHTSA make sync |
| `vehicle:models:{makeId}:{year}` | 7 Days | Admin add/edit model, or NHTSA sync |
| `vehicle:years:{modelId}` | 7 Days | Admin year update |
| `vehicle:specifications:{modelId}:{year}` | 7 Days | Specification import |
| `vehicle:search:{normalizedQuery}` | 1 Day (86,400 s) | Cleared on catalog re-index |

TTL settings are defined in `backend/config/vehicles.php` and can be customized via `.env`:
```env
VEHICLE_CACHE_TTL_MAKES=604800
VEHICLE_CACHE_TTL_MODELS=604800
VEHICLE_CACHE_TTL_SPECS=604800
```

---

## 6. Sync Strategy & Rate Limiting

1. **Lazy Loading on Demand**: The application does not load the entirety of NHTSA (over 10,000 global manufacturers). Instead, users trigger lazy syncs for requested makes, or administrators trigger controlled regional syncs.
2. **Controlled Artisan Commands**:
   - `php artisan vehicle:sync-makes`: Syncs top regional manufacturers.
   - `php artisan vehicle:sync-models --make=Toyota`: Syncs models for a specific make.
   - `php artisan vehicle:sync`: Controlled regional sync for priority makes (Toyota, Nissan, Hyundai, Lexus, Honda, Kia, Ford, Mercedes-Benz, BMW).
3. **vPIC Automated Traffic Rate Control Compliance**:
   - HTTP requests enforce a minimum 250ms interval between calls.
   - Backoff retry with `CURLOPT_TIMEOUT = 12`.
   - Client search inputs use 300–500ms debouncing to prevent spam queries.

---

## 7. Mobile API Contracts

### 7.1. Vehicle Selection Endpoints
- `GET /api/v1/vehicles/makes`: Returns active makes with bilingual names and slugs.
- `GET /api/v1/vehicles/makes/{make}/models?year=2022`: Returns models for a make.
- `GET /api/v1/vehicles/models/{model}/years`: Returns production years.
- `GET /api/v1/vehicles/{model}/specifications?year=2022`: Returns optional engine/trim specs.
- `GET /api/v1/vehicles/search?q=تويوتا`: Normalized bilingual search.

### 7.2. User Garage Endpoints
- `GET /api/v1/me/vehicles`: Lists user's saved vehicles.
- `POST /api/v1/me/vehicles`: Saves a new vehicle to garage.
- `POST /api/v1/me/vehicles/{id}/default`: Sets vehicle as the active default for parts filtering.
- `DELETE /api/v1/me/vehicles/{id}`: Removes vehicle from garage.

---

## 8. Limitations & Regional Considerations

1. **US-Market Focus of vPIC**: NHTSA is maintained by the US Department of Transportation. While it covers major global manufacturers, certain GCC or Middle Eastern exclusive model trims or local naming conventions (e.g. Land Cruiser "Shas", Hilux regional packages) may not have exact vPIC records.
2. **Manual Admin Override**: To guarantee 100% regional accuracy, administrators can create manual makes, models, and specifications via the Admin Catalog Console (`Admin -> Vehicles`).
3. **No Automotive Parts Data in NHTSA**: NHTSA does not know which brake pad fits which Camry. Compatibility is maintained internally via `product_vehicle_compatibilities`.
