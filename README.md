# URL Shortener

A URL shortening service built with Express, PostgreSQL, and Redis.

## Screenshot

![Happy path: shortening a URL and live cache stats](./Default%20happy%20path.png)

## Architecture

```mermaid
flowchart LR
    Client["React Client"] -->|"POST /shorten\nGET /:code"| API["Express API"]
    API -->|"cache lookup"| Redis[("Redis")]
    API -->|"insert / fallback lookup"| Postgres[("PostgreSQL")]
    Redis -.->|"populate on miss"| API
```

On a redirect, the API checks Redis first; on a cache miss it falls back to PostgreSQL and repopulates the cache.

## Tech Stack

- **Express** — HTTP server
- **PostgreSQL** (`pg`) — persistent storage for URL mappings
- **Redis** (`ioredis`) — caching layer
- **nanoid** — short ID generation
- **cors** — cross-origin request support

## Getting Started

```bash
npm install
npm test
```

## TODO

- [ ] Sequential ID + Base62 Encoding
