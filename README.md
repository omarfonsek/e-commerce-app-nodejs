# E-commerce API (Node.js)

REST API for an e-commerce backend built with Express 5, Sequelize and MySQL, with request validation powered by Zod.

> **Project status:** work in progress. The **products** module is fully implemented (CRUD). The data models for customers, carts, categories, orders and payments are defined, but they do not expose any endpoints yet.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Error handling](#error-handling)
- [Available scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)

## Features

- **Products CRUD:** list, get by id, create, update (partial) and delete.
- **Input validation with Zod:** body and URL params are validated before reaching the controller. All validation errors from every source are collected and returned together.
- **Centralized error handling:** application and Sequelize errors are mapped to consistent HTTP status codes and a single JSON error format.
- **Strict id parsing:** URL ids must be positive 32-bit integers (no leading zeros, signs, decimals, scientific or hex notation).
- **Development-only schema sync:** `POST /db/sync` creates or updates the tables from the Sequelize models. It is only mounted when `NODE_ENV=development`.

## Tech stack

| Area | Technology |
|---|---|
| Runtime | Node.js 24 (CommonJS) |
| Package manager | npm 11 |
| Web framework | Express 5 |
| ORM | Sequelize 6 |
| Database | MySQL 8 (via `mysql2`) |
| Validation | Zod 4 |
| Configuration | dotenv |

## Architecture

The app is split into a process entry point and an exportable Express app:

- `local.js` loads the environment and starts the HTTP listener.
- `server.js` builds and exports the Express app **without** a listener, so it can be imported by tests or another host.

Request pipeline (in order, defined in `server.js`):

```
express.json()
  → /db        (only when NODE_ENV=development)
  → /products
  → catch-all  → 404 ROUTE_NOT_FOUND
  → errorHandler (global error middleware)
```

Each domain lives in its own folder with three layers:

| Layer | Responsibility |
|---|---|
| `routes.js` | Maps routes to controller functions and applies `validate({ params, body })` with the domain schemas. |
| `*.controller.js` | Reads already-validated data from `req.validated`, calls the service and sends the response. Errors are forwarded with `.catch(next)`. |
| `*.service.js` | All Sequelize access and business rules. Returns a result object with the HTTP status on success and **throws** an `AppError` subclass on failure. |

Models are auto-loaded: every `*.model.js` file in `code/database/models/` is registered by `index.js`, and their associations are wired after loading.

**Domain relationships:** customer 1—N order, customer 1—N payment, customer 1—1 cart; payment 1—N order; product M—N cart (`cartProducts`), product M—N category (`productCategories`), product M—N order through `orderDetail` (which also stores `quantity` and `price`).

## Project structure

```
.
├── README.md
└── code/                         # npm project root: run every npm command from here
    ├── local.js                  # Entry point: loads env and starts the listener
    ├── server.js                 # Express app (exported, no listener)
    ├── .env.example              # Environment variable template
    ├── .nvmrc                    # Node.js version (24)
    ├── config/
    │   └── config.js             # Reads env variables into the dbConfig structure
    ├── database/
    │   ├── db.js                 # POST /db/sync route (development only)
    │   └── models/               # Sequelize models, auto-loaded by index.js
    ├── middlewares/
    │   ├── error.middleware.js   # Global error handler (mapError + response format)
    │   ├── validate.js           # Zod validation middleware
    │   ├── validators/           # Zod schemas per domain
    │   ├── errors/
    │   │   ├── httpErrors.js     # NotFoundError, ConflictError, UnauthorizedError, ...
    │   │   └── codes.js          # Frozen catalog of business error codes
    │   └── utils/
    │       └── AppError.js       # Base application error class
    └── product/                  # Products domain
        ├── routes.js
        ├── product.controller.js
        └── product.service.js
```

## Prerequisites

- **Node.js 24** and **npm 11** or newer. `package.json` enforces this through `devEngines`, so `npm ci` fails with other versions.
  - With [nvm](https://github.com/nvm-sh/nvm): run `nvm use` inside `code/` (it reads `.nvmrc`).
  - With [nvm-windows](https://github.com/coreybutler/nvm-windows): run `nvm use 24` (it does not read `.nvmrc`).
- **Docker**, to run MySQL locally. Alternatively, any reachable MySQL 8 server.

## Getting started

### 1. Clone and install dependencies

All npm commands run from the `code/` directory. dotenv also looks for `.env` in the current working directory, so the app must be started from there.

```bash
git clone https://github.com/omarfonsek/e-commerce-app-nodejs.git
cd e-commerce-app-nodejs/code
npm ci
```

> Use `npm ci` rather than `npm install`: it installs exactly what `package-lock.json` specifies, starting from a clean `node_modules`.

### 2. Create your `.env`

Bash:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

The default values already match the database container from the next step. See [Configuration](#configuration) for details.

### 3. Start MySQL with Docker

The credentials below are the same placeholder values used in `.env.example`. Replace `<root_password>` with a password of your choice.

```bash
docker run -d --name ecommerce-db -e MYSQL_ROOT_PASSWORD=<root_password> -e MYSQL_DATABASE=ecommerce -e MYSQL_USER=ecommerce_user -e MYSQL_PASSWORD=change_this -p 127.0.0.1:3306:3306 -v ecommerce-mysql-data:/var/lib/mysql mysql:8.4
```

The first start takes around 20–40 seconds. Wait until the logs show `ready for connections` after `Creating user ecommerce_user`:

```bash
docker logs -f ecommerce-db
```

Press `Ctrl+C` to stop following the logs (the container keeps running). Later, use `docker stop ecommerce-db` and `docker start ecommerce-db`.

### 4. Start the API

```bash
npm start
```

Expected output (the port comes from `PORT_APP`):

```
Servidor escuchando en http://localhost:3000
```

### 5. Create the database schema

There are no migrations yet. The tables are created from the models through the sync endpoint, which runs `sequelize.sync({ alter: true })`. Run it again after changing any model.

Bash:

```bash
curl -X POST http://localhost:3000/db/sync
```

PowerShell:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/db/sync
```

Expected response:

```json
{ "synced": true, "at": "2026-01-01T00:00:00.000Z" }
```

> This endpoint only exists when `NODE_ENV=development`. In any other environment it returns `404`.

### 6. Verify

```bash
curl -i http://localhost:3000/products   # 204 No Content (no products yet)
curl -i http://localhost:3000/nope       # 404 ROUTE_NOT_FOUND
```

## Configuration

All variables are listed in [`code/.env.example`](code/.env.example). `code/.env` is ignored by git: never commit it.

| Variable | Description | Default in `.env.example` |
|---|---|---|
| `PORT_APP` | HTTP port of the API. Falls back to `4000` if unset. | `3000` |
| `DB_HOST` | MySQL host. | `127.0.0.1` |
| `DB_PORT` | MySQL port. | `3306` |
| `DB_USER` | MySQL user. | `ecommerce_user` |
| `DB_PASS` | MySQL password. | `change_this` |
| `DB_NAME` | Database name. | `ecommerce` |
| `DIALECT` | Sequelize dialect. | `mysql` |
| `NODE_ENV` | `development` mounts `POST /db/sync` and adds `stack` to error responses. | `development` |

> The default credentials are placeholders for a local, throwaway database. Do not reuse them anywhere else.

## API reference

Base URL: `http://localhost:<PORT_APP>`. Request bodies must be sent as `application/json`.

| Method | Path | Description | Success |
|---|---|---|---|
| `GET` | `/products` | List all products | `200`, or `204` if there are none |
| `GET` | `/products/:id` | Get a product by id | `200` |
| `POST` | `/products` | Create a product | `201` |
| `PUT` | `/products/:id` | Partially update a product | `200` |
| `DELETE` | `/products/:id` | Delete a product | `204` |
| `POST` | `/db/sync` | Create or update the schema (development only) | `200` |

### Product fields

| Field | Type | Create | Update | Rules |
|---|---|---|---|---|
| `name` | string | required | optional | Trimmed, 1–255 characters, unique |
| `price` | number | required | optional | Non-negative |
| `picture` | string \| null | optional | optional | Valid URL, max 255 characters |

Unknown fields are discarded. An update must include at least one field. `price: 0` and `picture: null` are valid.

The `id` path parameter must be a positive integer within the 32-bit `INT` range, with no leading zeros, signs, decimals, scientific or hex notation (`1` is valid; `0`, `01`, `+1`, `1.5`, `1e3`, `0x1` and `2147483648` are rejected).

### Examples

**Create a product**

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Coffee Mug","price":12.5,"picture":"https://example.com/mug.png"}'
```

```json
{
  "success": true,
  "status": 201,
  "message": "Product added Database",
  "product": {
    "id": 1,
    "name": "Coffee Mug",
    "picture": "https://example.com/mug.png",
    "price": 12.5,
    "description": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**List products** (`200`)

```json
{ "success": true, "status": 200, "data": [ { "id": 1, "name": "Coffee Mug", "...": "..." } ] }
```

**Get a product** (`200`)

```json
{ "success": true, "status": 200, "product": { "id": 1, "name": "Coffee Mug", "...": "..." } }
```

**Update a product** (`200`, returns the updated product without a wrapper)

```bash
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":15}'
```

```json
{ "id": 1, "name": "Coffee Mug", "picture": "https://example.com/mug.png", "price": 15, "...": "..." }
```

**Delete a product** (`204 No Content`, empty body)

```bash
curl -i -X DELETE http://localhost:3000/products/1
```

> The success response shape currently differs between endpoints (see [Known limitations](#known-limitations)).

## Error handling

Every error response has the same shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "path": "body.name", "message": "The field is mandatory" },
      { "path": "body.price", "message": "The price cannot be negative" }
    ]
  }
}
```

- `code` and `message` are always present; `details` is optional.
- `stack` is added only when `NODE_ENV=development`.
- `500` responses return a generic message and never expose the original cause. Only errors with status `>= 500` are logged.

| Status | Code | When |
|---|---|---|
| 400 | `MALFORMED_JSON` | The body is not valid JSON |
| 404 | `PRODUCT_NOT_FOUND` | The product id does not exist |
| 404 | `ROUTE_NOT_FOUND` | The route does not exist |
| 409 | `DUPLICATE_PRODUCT` | A product with the same name already exists (create) |
| 409 | `DUPLICATE` | Database unique constraint violation |
| 409 | `FK_CONSTRAINT` | Invalid reference or resource in use |
| 413 | `PAYLOAD_TOO_LARGE` | The body is too large |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | A non-empty body was not sent as `application/json` |
| 422 | `VALIDATION_ERROR` | Zod validation or Sequelize validation failed |
| 503 | `DB_UNAVAILABLE` | Database connection error or timeout |
| 500 | `DB_ERROR` / `INTERNAL` | Unexpected database or server error |

## Available scripts

Run from `code/`:

| Command | Description |
|---|---|
| `npm ci` | Clean install from `package-lock.json` |
| `npm start` | Start the API (`node local.js`) |
| `npm test` | Placeholder: no test suite yet, exits with code 1 |

## Troubleshooting

**Port 3306 is already in use** (for example, a local MySQL installation)

Publish the container on another host port and change only `DB_PORT` in your `.env`:

```bash
docker run ... -p 127.0.0.1:3307:3306 ... mysql:8.4
```

```dotenv
DB_PORT=3307
```

**The MySQL container stops right after starting and the logs say `data files are corrupt`**

A previous first-time initialization was interrupted and left the volume half-written. Remove both the container and the volume, then run `docker run` again and let it finish:

```bash
docker rm -f ecommerce-db
docker volume rm ecommerce-mysql-data
```

**Changing the `MYSQL_*` variables has no effect**

The database and user are only created when the volume is empty. Remove the volume (see above) to apply new values.

**`Error: Cannot find module '...'`**

`node_modules` is incomplete or out of date. Run `npm ci` again from `code/`.

**`npm ci` fails with an engine or `devEngines` error**

Your Node.js or npm version does not match the requirements. Switch to Node.js 24 (see [Prerequisites](#prerequisites)).

**`POST /db/sync` returns `404`**

`NODE_ENV` is not `development` in your `.env`.

**The API does not pick up your `.env`**

Make sure you start it from the `code/` directory.

## Known limitations

- Only the products module exposes endpoints.
- No authentication: write endpoints are public.
- No automated tests and no CI yet.
- The schema is managed with `sequelize.sync({ alter: true })`; there are no migrations.
- The success response shape is not consistent across product endpoints, and an empty product list returns `204` instead of `200` with an empty array.
- The `description` column exists in the product model but cannot be set through the API yet.
- There is no Dockerfile for the API; Docker is only used for the database.

## Contributing

- Branches follow `feature/<name>` (for example, `feature/GET-product`) and are merged into `master` through pull requests.
- New domains follow the `product/` layout: `routes.js`, `*.controller.js` and `*.service.js`, with Zod schemas in `middlewares/validators/`.
- Services throw `AppError` subclasses with codes from `middlewares/errors/codes.js`; add new business codes to that catalog first.
- After adding or changing a model, run `POST /db/sync` again.
