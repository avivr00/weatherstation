#!/usr/bin/env bash
# Start script that runs migrations then starts the app
set -euo pipefail

DB_PATH="test.db"

echo "Running lightweight SQLite migrations against ${DB_PATH}..."
python scripts/sqlite_migrate.py --db "${DB_PATH}"

# Start uvicorn; Render sets $PORT
PORT=${PORT:-8000}
echo "Starting uvicorn on 0.0.0.0:${PORT}..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
