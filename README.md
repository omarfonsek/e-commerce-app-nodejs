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
- [Running tests](#running-tests)
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
- **Automated tests:** `node:test` + `supertest` against a dedicated MySQL test database, protected by a guard that refuses to run on any database whose name does not end in `_test`.
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
| Testing | `node:test` (built-in runner) + supertest |

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
    ├── .env.test.example         # Test environment template (copy to .env.test)
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
    ├── product/                  # Products domain
    │   ├── routes.js
    │   ├── product.controller.js
    │   └── product.service.js
    └── test/                     # Test suite (node:test + supertest)
        ├── helpers/
        │   └── db.js             # resetDb/closeDb + guard: DB_NAME must end in _test
        └── smoke.test.js         # Smoke test: app, test database and runner are wired
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
curl -i http://localhost:3000/products   # 200 {"products":[]} (no products yet)
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

The test suite uses its own file, `code/.env.test`, with the same keys: see [Running tests](#running-tests).

## Running tests

The tests run with the built-in Node.js runner (`node:test`) and [supertest](https://github.com/ladjs/supertest), which sends HTTP requests to the Express app exported by `server.js` without starting a listener.

They need a **separate MySQL database**: before each test file, the helper in `test/helpers/db.js` runs `sequelize.sync({ force: true })`, which **drops and recreates every table**. Never point the tests at a database whose data you want to keep.

### 1. Create the test database and user

Open a MySQL shell as root inside the container (it prompts for the root password):

```bash
docker exec -it ecommerce-db mysql -uroot -p
```

Create a dedicated database and a user that can access **only** that database. Replace `<test_user_password>` with a password of your choice:

```sql
CREATE DATABASE ecommerce_test;
CREATE USER 'ecommerce_test_user'@'%' IDENTIFIED BY '<test_user_password>';
GRANT ALL PRIVILEGES ON ecommerce_test.* TO 'ecommerce_test_user'@'%';
```

Type `exit` to leave the MySQL shell. Optionally, log in as the new user (`-uecommerce_test_user -p`) and check that `SHOW DATABASES;` lists `ecommerce_test` but not `ecommerce`.

### 2. Create your `.env.test`

Bash:

```bash
cp .env.test.example .env.test
```

PowerShell:

```powershell
Copy-Item .env.test.example .env.test
```

Set `DB_PASS` to the password from the previous step, and `DB_PORT` to the same port as in your `.env`. `code/.env.test` is ignored by git: never commit it.

| Variable | Value in `.env.test.example` | Notes |
|---|---|---|
| `DB_USER` | `ecommerce_test_user` | Test-only user |
| `DB_PASS` | `your_test_user_password` | Replace it |
| `DB_NAME` | `ecommerce_test` | **Must end in `_test`**, or the suite refuses to run |
| `NODE_ENV` | `test` | `POST /db/sync` is not mounted and errors have no `stack` |

`PORT_APP` is not needed: supertest never opens a port.

### 3. Run the suite

The MySQL container must be running.

```bash
npm test
```

The script runs `node --env-file=.env.test --test --test-concurrency=1 "test/**/*.test.js"`:

- `--env-file=.env.test` loads the test configuration **before** any code runs. dotenv (called in `config/config.js`) does not override variables that already exist, so `.env` cannot replace them. It can still fill in keys that are **missing** from `.env.test`, which is why every database key must be defined there.
- `--test-concurrency=1` runs the test files one at a time. Each file resets the same database, so running them in parallel would make them interfere with each other.
- Test files live in `code/test/` and must end in `.test.js`.

### Safety layers

Three independent layers keep the tests away from your development data:

| Layer | Protects you when |
|---|---|
| Separate database (`ecommerce_test`) | Everything is configured correctly |
| Test user with privileges only on `ecommerce_test` | `DB_NAME` ends up pointing to another database |
| Guard in `test/helpers/db.js`: if `DB_NAME` is missing or does not end in `_test`, it throws as soon as the module is loaded, before any connection is opened | Everything else failed, including credentials filled in from `.env` |

### Writing tests

- Require `./helpers/db` **before** `../server`, so a wrong configuration stops the file before the app loads.
- Call `resetDb` in a `before` hook and `closeDb` in an `after` hook. Without `closeDb`, the connection pool keeps the process alive for several seconds after the tests finish.
- Use `node:assert/strict`. The loose `assert.deepEqual` compares with `==`, so `"10.50"` would equal `10.5`.
- Never expose `sync({ force: true })` through an HTTP route; it belongs only in the test helper.

## API reference

Base URL: `http://localhost:<PORT_APP>`. Request bodies must be sent as `application/json`.

| Method | Path | Description | Success |
|---|---|---|---|
| `GET` | `/products` | List all products | `200` (empty array if there are none) |
| `GET` | `/products/:id` | Get a product by id | `200` |
| `POST` | `/products` | Create a product | `201` |
| `PUT` | `/products/:id` | Partially update a product | `200` |
| `DELETE` | `/products/:id` | Delete a product | `204` |
| `POST` | `/db/sync` | Create or update the schema (development only) | `200` |

### Response format

All success responses follow the same contract:

| Case | Status | Body |
|---|---|---|
| Single resource | `200` / `201` | The resource wrapped in a key named after the entity: `{ "product": { ... } }` |
| Collection | `200` | The list wrapped in the plural key: `{ "products": [ ... ] }`. An empty collection is `{ "products": [] }`, never `204` |
| No content | `204` | Empty body (used by `DELETE`) |

- The HTTP status code is the only success indicator: bodies do not include `success`, `status` or `message` fields.
- Error responses use a different, fixed shape: see [Error handling](#error-handling).

### Product fields

| Field | Type | Create | Update | Rules |
|---|---|---|---|---|
| `name` | string | required | optional | Trimmed, 1–255 characters, unique |
| `price` | number | required | optional | Non-negative |
| `picture` | string \| null | optional | optional | Valid URL, max 255 characters |

Unknown fields are discarded. An update must include at least one field. `price: 0` and `picture: null` are valid.

The `id` path parameter must be a positive integer within the 32-bit `INT` range, with no leading zeros, signs, decimals, scientific or hex notation (`1` is valid; `0`, `01`, `+1`, `1.5`, `1e3`, `0x1` and `2147483648` are rejected).

### Examples

**Create a product** (`201`)

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Coffee Mug","price":12.5,"picture":"https://example.com/mug.png"}'
```

```json
{
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

```bash
curl http://localhost:3000/products
```

```json
{ "products": [ { "id": 1, "name": "Coffee Mug", "...": "..." } ] }
```

With no products:

```json
{ "products": [] }
```

**Get a product** (`200`)

```bash
curl http://localhost:3000/products/1
```

```json
{ "product": { "id": 1, "name": "Coffee Mug", "...": "..." } }
```

**Update a product** (`200`, returns the updated product)

```bash
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":15}'
```

```json
{ "product": { "id": 1, "name": "Coffee Mug", "picture": "https://example.com/mug.png", "price": 15, "...": "..." } }
```

**Delete a product** (`204 No Content`, empty body)

```bash
curl -i -X DELETE http://localhost:3000/products/1
```

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
| `npm test` | Run the test suite against the test database (see [Running tests](#running-tests)) |

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

**`npm test` fails with `Database name must end in "_test"` or `Database name is required`**

The guard in `test/helpers/db.js` stopped the suite before it touched any database. Check that `code/.env.test` exists and defines `DB_NAME` (for example, `ecommerce_test`). Also check that `DB_NAME` is not set in your shell: variables already present in the environment take precedence over `.env.test`.

**`npm test` fails with `Access denied for user 'ecommerce_test_user'`**

The test user or its privileges do not exist, or `DB_PASS` in `.env.test` does not match. Repeat [step 1 of Running tests](#1-create-the-test-database-and-user).

**`npm test` fails with `ECONNREFUSED`**

The MySQL container is not running. Start it with `docker start ecommerce-db`.

**`npm test` fails with `.env.test: not found`**

Create it from the template (see [step 2 of Running tests](#2-create-your-envtest)). The suite never falls back to `.env`.

**`npm test` reports `tests 0`**

No file matched `test/**/*.test.js`. Check the file name and run the command from `code/`.

## Known limitations

- Only the products module exposes endpoints.
- No authentication: write endpoints are public.
- No CI yet: the test suite currently contains only a smoke test, and it must be run locally.
- The schema is managed with `sequelize.sync({ alter: true })`; there are no migrations.
- The `description` column exists in the product model but cannot be set through the API yet.
- There is no Dockerfile for the API; Docker is only used for the database.

## Contributing

- Branches follow `feature/<name>` (for example, `feature/GET-product`) and are merged into `master` through pull requests.
- New domains follow the `product/` layout: `routes.js`, `*.controller.js` and `*.service.js`, with Zod schemas in `middlewares/validators/`.
- New endpoints follow the [response format](#response-format): entity-named keys, no `success`/`status`/`message` in the body, and `204` without a body.
- Services throw `AppError` subclasses with codes from `middlewares/errors/codes.js`; add new business codes to that catalog first.
- After adding or changing a model, run `POST /db/sync` again.
- Run `npm test` before opening a pull request. New tests go in `code/test/` with the `.test.js` suffix (see [Writing tests](#writing-tests)).
