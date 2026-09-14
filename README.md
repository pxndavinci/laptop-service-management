# Laptop Service Management

A simple web app for a small laptop repair shop: log service orders, track repair status, and keep customer & device history — without unnecessary complexity.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite, TypeScript, Material UI, TanStack Query, React Hook Form + Zod, Zustand |
| API contract | OpenAPI 3 (`backend/src/openapi/openapi.yaml`) — single source of truth |
| Backend  | Node.js, Express, TypeScript, Kysely (typed query builder) |
| Database | PostgreSQL (`schema.sql`) |

## How It Fits Together (API-First)

```
schema.sql  ──►  Postgres
                    ▲
openapi.yaml ──►  backend (routes → controllers → services → repos → Kysely)
      │                 ▲
      │                 └── express-openapi-validator validates every request
      └──► orval ──► frontend/src/api (generated React Query hooks)
```

The OpenAPI document drives everything: the backend validates requests against it at runtime, and the frontend client is generated from it. If you change the API, change the YAML first.

## Getting Started

> **Environment files** are never committed. Each `.env.example` is copied to `.env` and filled in. The backend refuses to start without its required values and prints what is missing.

### Development: database in Docker, apps local

```bash
# 0. Compose settings (once): set POSTGRES_PASSWORD and JWT_SECRET
cp .env.example .env

# 1. Database (Postgres 16 on 127.0.0.1:5433, schema applied on first start)
docker compose up -d postgres

# 2. Backend
cd backend
cp .env.example .env        # set DB_USER/DB_PASSWORD/DB_NAME to match the root .env, plus JWT_SECRET and STAFF_*
npm install
npm run migrate             # apply pending migrations
npm run seed                # roles, statuses, staff login
npm run dev                 # http://localhost:3000, Swagger UI at /api-docs

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:3001
```

The frontend works without a `.env` (it defaults to `http://localhost:3000`).

### Checks (same as CI)

```bash
cd backend  && npm run typecheck && npm run lint && npm run format:check && npm run build
cd frontend && npx orval && git diff --exit-code src/api && npm run typecheck && npm run lint && npm run build
```

CI (`.github/workflows/ci.yml`) also fails when `frontend/src/api` is out of date with `openapi.yaml`, and builds all Docker images.

### First-run data

`npm run seed` (and every production container start) inserts the `customer` (1) and `admin` (99) roles, the canonical repair statuses, and the staff user + login from `STAFF_USERNAME` / `STAFF_PASSWORD`. Existing rows are skipped, so it is safe to re-run.

### Repair statuses

The seed guarantees this canonical set; the list filter and dashboard rely on these exact names.

| Status | Meaning | Open/closed |
|--------|---------|-------------|
| `RECEIVED` | Device logged at the counter (orders with no status entry count as this) | open |
| `IN_PROGRESS` | Being repaired | open |
| `ON_HOLD` | Waiting on parts or the customer | open |
| `COMPLETED` | Repair done, waiting for pickup | open (work done) |
| `DELIVERED` | Handed back to the customer | closed |
| `CANCELLED` | Abandoned | closed |

Lifecycle: **Received → In Progress (↔ On Hold) → Completed → Delivered**. An order's current status is its latest status entry.

## Production Deployment

The whole stack runs from `docker-compose.yaml`. It is deployable on any Docker host; **picking and wiring the host is still open** (see the last table).

```bash
git clone https://github.com/pxndavinci/laptop-service-management.git
cd laptop-service-management
cp .env.example .env    # set POSTGRES_PASSWORD, JWT_SECRET, STAFF_PASSWORD, PUBLIC_URL, COOKIE_SECURE
docker compose up -d --build
```

Open `http://<host>:8080` (`APP_BIND` / `APP_PORT`). Log in with `STAFF_USERNAME` / `STAFF_PASSWORD`.

**What runs**

| Service | Image | Notes |
|---------|-------|-------|
| `frontend` | multi-stage: Vite build → `nginx-unprivileged` | The only published port. Serves the UI and proxies `/api/*` to the backend (one origin, so no CORS and the session cookie just works). Security headers, gzip, immutable caching for hashed assets, SPA fallback. |
| `backend` | multi-stage: `tsc` build → `node:24-alpine` with production deps only | Runs as `node`. On start: applies pending migrations, seeds reference data, starts the API. Not published; reachable only through nginx. |
| `postgres` | `postgres:16` | Data in the named volume `lsm_postgres_data`. Port bound to `127.0.0.1` only. |
| `deployer` | `docker:cli` + Python | Release watcher; idle unless `AUTO_DEPLOY_ENABLED=true` (see below). |

**Healthchecks:** Postgres uses `pg_isready`. The backend checks `GET /health`, which also runs `select 1`. The frontend checks nginx `GET /healthz`. Each service starts only after the service it depends on is healthy.

**Data safety**

- Recreating or rebuilding containers keeps the volume. Never run `docker compose down -v` on the server; `-v` deletes the database.
- `schema.sql` runs only on an empty volume. Every later schema change ships as a new idempotent file in `backend/migrations/` (e.g. `0002_add_x.sql`). The backend applies it on start and records it in `schema_migrations`.
- Keep `postgres:16` pinned; a new major version cannot open the old data directory without a dump/restore.

**Useful commands**

```bash
docker compose ps                                   # health of each service
docker compose logs -f backend                      # API logs
docker compose exec backend node dist/scripts/set-staff-password.js   # uses STAFF_USERNAME/STAFF_PASSWORD from the env
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > backup.dump
docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < backup.dump
```

**Still to decide per host (not configured here)**

| Item | Why it matters |
|------|----------------|
| Domain + TLS | Browsers need HTTPS for a login. Terminate TLS in front of port 8080 (e.g. a Cloudflare Tunnel or a reverse proxy), then set `PUBLIC_URL` and `COOKIE_SECURE=true`. |
| Backup strategy | The release watcher keeps the last 14 pre-deploy dumps in `./backups/` on the same disk. That is not a backup against disk loss: schedule `pg_dump` and copy it off the machine. |
| Exposure | `APP_BIND=0.0.0.0` makes the app reachable from the LAN over plain HTTP. With `COOKIE_SECURE=true` logins only work over HTTPS. Use `APP_BIND=127.0.0.1` if only a tunnel on the same host should reach it. |
| Monitoring | Nothing alerts yet when a service is unhealthy or a deploy rolls back; watch `docker compose logs deployer`. |

## Automatic Deploys (release watcher)

`deploy/auto_deploy.py` runs as the `deployer` service. It watches GitHub for a **new published release** (drafts and pre-releases are ignored) and deploys it **only between 23:00 and 07:00 IST**. Nobody is using the shop app at night.

**On a new release it:**

1. Refuses to continue if tracked files in the checkout were edited by hand.
2. Fetches the release tag and **dumps the database** to `backups/lsm-<time>-before-<tag>.dump` (keeps the last `BACKUP_KEEP`).
3. Checks out the tag and builds the images **while the old containers keep serving**.
4. Runs `docker compose up -d` for `postgres backend frontend`. It never runs `down` and never touches the volume. The backend applies new migrations on start.
5. Waits for the healthchecks. **If they fail, it checks out the previous release and rebuilds it**, then marks the release as failed so it is not retried every poll. Publish a fixed release to move on.
6. If the release changed `deploy/`, it rebuilds itself from a short-lived helper container.

State is kept in `.deploy/state.json`. Logs go to `docker compose logs deployer`.

**Turn it on (server checkout only)**

```bash
# in .env of the server checkout
AUTO_DEPLOY_ENABLED=true
LSM_UID=$(id -u)  LSM_GID=$(id -g)  DOCKER_GID=$(stat -c %g /var/run/docker.sock)   # write the numbers into .env
docker compose up -d --build
```

- **Ship a release:** on GitHub, open Releases, draft a new release, create a tag such as `v1.2.0`, and publish. From the CLI: `gh release create v1.2.0 --generate-notes`.
- **Check it:** `docker compose run --rm deployer --status` prints the config, whether it is inside the window, and the deployed tag.
- **Deploy now:** run `docker compose stop deployer`, then `docker compose run --rm deployer --once --force`, then `docker compose start deployer`. This checks once and ignores the time window. A lock stops a second watcher from deploying at the same time.

**Keep in mind**

- The watcher mounts the Docker socket. That is root-equivalent access to the host, which is why it is off by default. Leave it off in development checkouts.
- Use a **dedicated clone** for the server. It must not be a working copy you edit or one that a sync tool such as Syncthing modifies. Hand edits block deploys by design.
- Migrations from a failed release stay applied after a rollback. Write migrations so the previous release still works with them: add columns and tables, don't drop or rename in the same release.
- The GitHub API allows 60 unauthenticated requests per hour. Polling every 10 minutes during the window uses 48 per night. Set `GITHUB_TOKEN` if the repo becomes private.

| Variable | Default | Purpose |
|----------|---------|---------|
| `AUTO_DEPLOY_ENABLED` | `false` | Master switch |
| `GITHUB_REPO` | `pxndavinci/laptop-service-management` | Repo whose releases are followed |
| `GITHUB_TOKEN` | — | Optional API token |
| `RELEASE_SOURCE` | `github` | `git-tags` follows the highest `vX.Y.Z` tag at `GIT_URL` instead (used for local testing) |
| `DEPLOY_WINDOW_START` / `DEPLOY_WINDOW_END` / `DEPLOY_TIMEZONE` | `23:00` / `07:00` / `Asia/Kolkata` | Deploy window; may cross midnight |
| `POLL_INTERVAL_SECONDS` | `600` | Poll interval inside the window (outside it the watcher sleeps until the window opens) |
| `BACKUP_KEEP` | `14` | Pre-deploy dumps to keep |
| `LSM_UID` / `LSM_GID` / `DOCKER_GID` | `1000` / `1000` / `962` | Host user owning the checkout, and the docker socket group |

## The Core Workflow

**New service order** (`/service-orders/new`) is the heart of the app. As the operator types a name, phone number, or serial number, the form searches existing records and offers suggestions:

- Picking a **customer** fills their contact details and links the existing record.
- Picking a **serial number** fills the entire form — customer, device, and product.
- Anything typed by hand is created as new records on submit.

The whole submission runs in **one database transaction** (`POST /service-order-composer/submit`): it reuses linked records, creates whatever is missing, and returns the order with an auto-assigned tag number (`YYNNNN`, e.g. `260001`, restarting every year).

**Around it:**

- **Dashboard (`/`):** orders received today, this week, month, and year. Also open orders, completed and delivered counts, overdue repairs, and finished repairs waiting over 2 days with a call button.
- **Orders (`/service-orders`):** partial tag search (`0004` finds `260004`), repair-status filter, and bulk delete. The detail page edits prices, payment, and dates, and adds, edits, or deletes status updates.
- **Customers (`/customers`):** create and edit with several phone numbers. The detail page shows devices and order history. Deleting a customer removes their devices and orders, after you type their name to confirm.
- **Products (`/products`):** create and edit with free-text brand and type, plus brand and type filters.

## Project Structure

```
schema.sql                  # Postgres schema for a fresh database
docker-compose.yaml         # production stack: postgres, backend, frontend (nginx), deployer
.env.example                # compose settings (secrets, ports, auto-deploy)
deploy/                     # release watcher (auto_deploy.py) + its Dockerfile
backend/migrations/         # schema changes after the first deploy, applied on start
backend/scripts/            # seed, migrate, start (prod entrypoint), set-staff-password
backend/src/
  openapi/openapi.yaml      # OpenAPI contract (source of truth for the API)
  config/env.ts             # validated environment access
  db/                       # Kysely instance + typed schema mirror
  routes/ controllers/      # HTTP layer (thin)
  services/                 # business rules, transactions, 404s
  repos/                    # all SQL, via Kysely
  models/                   # row types (derived from db/schema) + DTOs
frontend/nginx/             # nginx config for the production image
frontend/src/
  api/                      # GENERATED by orval — do not edit
  components/               # ServiceOrderForm and layout
  pages/                    # ServiceOrders (List/Create/Detail), Customers, Products
  lib/                      # config, zod schema, hooks, axios mutator
```

## Changing the API

1. Edit `backend/src/openapi/openapi.yaml`
2. Implement it in the backend (repo → service → controller → route)
3. Regenerate the frontend client:

```bash
cd frontend && npx orval
```

## Authentication

The app has one staff login (a login gate, not multi-user accounts).

- **Credentials** live in the `staff_account` table: a username plus a **bcrypt hash** (12 rounds) of the password — never the password itself. Device login passwords in `user_product` are a different case and stay plain text on purpose (see limitations).
- **Login flow:** `POST /auth/login` checks the password and sets an `lsm_session` cookie holding a signed JWT (HS256, `JWT_SECRET`). The cookie is `httpOnly` (JavaScript cannot read it) and `SameSite=Lax` (not sent on cross-site POST/DELETE, which blocks CSRF). Set `COOKIE_SECURE=true` once served over HTTPS.
- **Every other route** requires the session and returns `401` without it — except `/health`, `/api-docs`, `/auth/login`, `/auth/logout`. The frontend redirects to `/login` on any 401 and returns to the page you wanted after signing in.
- **Attribution:** the logged-in user is recorded as `entry_by` on new orders and as the default `assigned_to` on status updates. The server takes it from the session, never from the request body.
- **Brute force:** 10 failed logins per IP per 15 minutes, then `429`.
- **Revocation:** sessions expire after `SESSION_TTL_HOURS`. Changing the password signs out every existing session.

```bash
# first run: creates the login from STAFF_USERNAME / STAFF_PASSWORD
cd backend && npm run seed
# change the password later (signs out existing sessions)
STAFF_USERNAME=admin STAFF_PASSWORD='new long password' npm run staff:password
```

**Existing database from before auth?** Apply pending migrations, then seed:

```bash
cd backend && npm run migrate     # production containers do this automatically on start
```

## Environment Variables

Production settings live in the root `.env` (see `.env.example` and the deployment sections above). The per-app files below are for local development.

| File | Variable | Purpose |
|------|----------|---------|
| `backend/.env` | `DB_USER` `DB_PASSWORD` `DB_HOST` `DB_PORT` `DB_NAME` | Postgres connection (required) |
| `backend/.env` | `JWT_SECRET` | Signs session tokens; required, 32+ random chars (`openssl rand -base64 48`) |
| `backend/.env` | `SESSION_TTL_HOURS` | Login lifetime (default 12) |
| `backend/.env` | `COOKIE_SECURE` | `true` when served over HTTPS (default `false`) |
| `backend/.env` | `STAFF_NAME` `STAFF_USERNAME` `STAFF_PASSWORD` | Staff login created by `npm run seed` (password min 10 chars) |
| `backend/.env` | `PORT`, `CORS_ORIGIN` | Server port (3000) and allowed frontend origin |
| `backend/.env` | `TRUST_PROXY` | `true` behind a reverse proxy, so rate limiting sees real client IPs |
| `backend/.env` | `APP_TIMEZONE` | Timezone for dashboard day/week boundaries (default `Asia/Kolkata`) |
| `frontend/.env` | `VITE_API_BASE_URL` | Backend URL (default `http://localhost:3000`) |

## License

[MIT](LICENSE)

## Current Limitations

- **One staff login** — there are no per-person accounts or roles; everyone at the counter shares the login.
- Device login passwords are stored in plain text by design: technicians need them to service the machines.
- No invoices/receipts, CSV export or customer notifications yet (`notify customer` is recorded, not sent).
- Products that registered devices use cannot be deleted (by design: it would erase customers' devices and order history).
