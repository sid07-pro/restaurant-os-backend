# Production Deployment Guide

## 1. Railway Deployment

1. Connect your GitHub repository to Railway.
2. Add a PostgreSQL database service in Railway.
3. Configure Environment Variables in the Railway Dashboard:
   - `NODE_ENV=production`
   - `DATABASE_URL` (Reference the Railway Postgres URL)
   - `JWT_SECRET` (Generate a secure secret)
   - `CORS_ORIGINS` (Your frontend domains)
4. Railway will automatically detect the Dockerfile and build the image.
5. The `PORT` is automatically injected by Railway.

## 2. Render Deployment

1. Create a new Web Service in Render.
2. Connect your GitHub repository.
3. Choose "Docker" as the runtime.
4. Add a Render PostgreSQL database and link it.
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` (Internal DB URL)
   - `JWT_SECRET`
   - `CORS_ORIGINS`
6. Render handles the `PORT` binding.

## 3. Docker VPS Deployment (AWS, DigitalOcean, etc.)

1. Clone the repository on your server.
2. Create an `.env.production` file.
3. Run `docker-compose -f docker-compose.prod.yml up -d --build`.
4. The API will be available on port 8080.
5. Set up a reverse proxy (e.g., Nginx or Caddy) to handle SSL and route traffic to 8080.
