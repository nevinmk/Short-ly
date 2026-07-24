# URL Shortener

A URL shortening service built with Express, PostgreSQL, and Redis.

## Screenshot

![Happy path: shortening a URL and live cache stats](./Default%20happy%20path.png)

## Architecture

```mermaid
flowchart LR
    Client["React Client"] -->|"HTTP :80"| Nginx["nginx (reverse proxy)"]
    Nginx -->|"load-balanced"| API["Express API (x3 replicas)"]
    API -->|"cache lookup"| Redis[("Redis")]
    API -->|"insert / fallback lookup"| Postgres[("PostgreSQL")]
    Redis -.->|"populate on miss"| API
```

nginx is the single entry point into the Dockerized stack (port 80) and load-balances across 3 `api` replicas. It finds them the same way the API finds Postgres and Redis: by Docker Compose service name over the internal Docker network, not by IP. See [nginx.conf](./nginx.conf)'s `upstream api { server api:3000; }`, which resolves to the `api:` service in [docker-compose.yml](./docker-compose.yml).

On a redirect, the API checks Redis first; on a cache miss it falls back to PostgreSQL and repopulates the cache.

> **Note:** the React client currently calls the API directly at `http://localhost:3000` ([client/src/App.jsx](./client/src/App.jsx)). That only works when the API is run standalone via `npm run dev` — the `api` service in `docker-compose.yml` doesn't publish a host port, so the client can't reach it through Docker as configured today. Going through nginx means pointing the client at `http://localhost` (port 80) instead.

## Service names (Docker network)

Each service is reachable from other containers by its Compose key — this is what `nginx.conf` and the `api` service's env vars use instead of hardcoded IPs:

| Name | Resolves to |
|------|-------------|
| `nginx` | The reverse proxy / load balancer |
| `api` | The Express API (all 3 replicas share this name) |
| `postgres` | PostgreSQL |
| `redis` | Redis |

## Ports

| Port | Service | Started by |
|------|---------|------------|
| 80 | Nginx reverse proxy — load-balances across the 3 `api` replicas ([nginx.conf](./nginx.conf)) | `docker compose up -d` |
| 3000 | Express API — internal only, not published to the host when run via Docker | `docker compose up -d` (Docker network only), or `npm run dev` (standalone on the host) |
| 5173 | React client (Vite dev server) | `npm run dev` in `client/` |
| 5432 | PostgreSQL | `docker compose up -d` |
| 6379 | Redis | `docker compose up -d` |

## Tech Stack

- **Express** — HTTP server
- **PostgreSQL** (`pg`) — persistent storage for URL mappings
- **Redis** (`ioredis`) — caching layer
- **nanoid** — short ID generation
- **cors** — cross-origin request support

## Getting Started

### Prerequisites

- Node.js
- Docker (for Postgres and Redis)

### 1. Start Postgres and Redis

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` and Redis on `localhost:6379`, and seeds the `urls` table from [init.sql](./init.sql).

### 2. Configure environment variables

A `.env` file is already provided at the project root with defaults that match `docker-compose.yml`:

```
DATABASE_URL=postgres://appuser:apppass@localhost:5432/shortener
REDIS_URL=redis://localhost:6379
```

### 3. Run the API

```bash
npm install
npm run dev
```

The API starts on `http://localhost:3000`.

### 4. Run the client

```bash
cd client
npm install
npm run dev
```

The client starts on `http://localhost:5173` (Vite's default port).

## TODO

- [x] Scale Horizontally with Docker and Nginx
- [ ] Sequential ID + Base62 Encoding.
- [ ] Add a gif video of the auto cannon working.
- [ ] (Optional) Replace Artillery with Jmeter for better html reports.