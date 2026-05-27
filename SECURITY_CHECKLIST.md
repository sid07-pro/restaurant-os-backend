# Security Checklist

Before going live in a production environment, ensure the following checklist is completed:

- [ ] **Environment Variables:** No `.env` files are committed to version control.
- [ ] **JWT Secret:** `JWT_SECRET` is at least 32 characters, high entropy, and unique per environment.
- [ ] **Database Credentials:** `DATABASE_URL` uses secure credentials, and the database is not publicly accessible.
- [ ] **CORS:** `CORS_ORIGINS` is strictly limited to authorized frontend domains. Do NOT use `*` in production.
- [ ] **Reverse Proxy:** A reverse proxy (e.g., Nginx/Cloudflare) is set up in front of the application to handle HTTPS/TLS termination.
- [ ] **Trust Proxy:** If deployed behind a reverse proxy, ensure `app.set('trust proxy', 1)` is functioning correctly so rate limiting triggers on client IPs, not the proxy IP.
- [ ] **Docker:** Application is running as a non-root user (`node` user) inside the container.
- [ ] **Logging:** Production logs are being collected and no sensitive data (passwords, tokens, PII) is being logged.
- [ ] **Rate Limiting:** Global, Auth, and WebSocket rate limits are appropriately tuned to the expected traffic volume to prevent DDoS.
- [ ] **Payload Limits:** JSON/URL Encoded request sizes are restricted (defaulted to `100kb`).
