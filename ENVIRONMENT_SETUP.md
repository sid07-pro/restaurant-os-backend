# Environment Setup Guide

The application uses different `.env` files based on the `NODE_ENV` variable.

## Development (`.env.development`)
Used for local development. Rate limits are lenient, logging is pretty-printed, and stack traces are visible.
Run with: `npm run start:dev`

## Staging (`.env.staging`)
Used for a pre-production testing environment.
Run with: `NODE_ENV=staging npm run start`

## Production (`.env.production`)
Used in live environments. Rate limits are strict, logging is in structured JSON, and sensitive error details are hidden.
Run with: `NODE_ENV=production npm run start:prod` (or via Docker).

### Required Environment Variables
- `NODE_ENV`: Target environment (`development`, `staging`, `production`)
- `PORT`: Port to listen on (defaults to 3000 in dev, usually 8080 in prod)
- `DATABASE_URL`: Connection string for PostgreSQL
- `JWT_SECRET`: High entropy string for signing tokens
- `CORS_ORIGINS`: Allowed origins (e.g., `https://frontend.com`)

### Rate Limit Variables (Optional - have safe defaults)
- `RATE_LIMIT_GLOBAL_TTL`: Time-to-live for global rate limits (ms)
- `RATE_LIMIT_GLOBAL_LIMIT`: Max requests per TTL globally
- `RATE_LIMIT_AUTH_TTL`: TTL for auth endpoints
- `RATE_LIMIT_AUTH_LIMIT`: Max requests per TTL for auth
- `RATE_LIMIT_WS_TTL`: TTL for WebSocket connections
- `RATE_LIMIT_WS_LIMIT`: Max WS connections per TTL
