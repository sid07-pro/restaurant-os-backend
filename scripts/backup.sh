#!/bin/bash
# scripts/backup.sh
# Performs a backup of the PostgreSQL database using pg_dump.

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_$TIMESTAMP.sql"

echo "Starting database backup to $BACKUP_FILE..."
pg_dump "$DATABASE_URL" -F c -f "$BACKUP_FILE"

echo "Backup completed successfully."
