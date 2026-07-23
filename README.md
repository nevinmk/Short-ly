# URL Shortener

A URL shortening service built with Express, PostgreSQL, and Redis.

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
