sqlite_migrate.py — lightweight SQLite migration runner

Purpose
- Small, repeatable migration runner for SQLite databases using PRAGMA user_version.
- Designed for small additive schema changes (ADD COLUMN, CREATE TABLE) and safe re-runs.

How it works
- Keeps a MIGRATIONS map: integer version -> list of SQL statements.
- Reads current version from `PRAGMA user_version`.
- Applies migrations with higher version numbers in order, inside transactions.
- Backs up the DB file before applying any migrations.
- Treats common `sqlite3.OperationalError` for additive operations (e.g. duplicate column) as non-fatal so re-running is safe.

Usage
- Dry-run (shows statements that would run):
  /home/aviv/Src/weatherstation/backend/venv/bin/python scripts/sqlite_migrate.py --db test.db --dry-run

- Apply migrations:
  /home/aviv/Src/weatherstation/backend/venv/bin/python scripts/sqlite_migrate.py --db test.db

How to add a migration
- Open `scripts/sqlite_migrate.py` and add a new key to the `MIGRATIONS` dict with an integer higher than existing keys.
  Example:
    MIGRATIONS = {
      1: ["ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0 NOT NULL;"],
      2: ["CREATE TABLE foo (id INTEGER PRIMARY KEY, name TEXT NOT NULL);"]
    }
- The runner will apply 2 after 1 once the DB is at version 1.

Safety notes
- The script makes a backup copy of the DB file (same name with `.bak` suffix) before applying migrations.
- For complex migrations (drop/rename columns, heavy refactors), prefer creating a new table and copying data, or use a more advanced tool (Alembic).
- Test migrations on a copy of your DB before running on production.

CI / Tests
- For tests, prefer using an in-memory DB or ensure the migration script runs in test setup.
 
Starting on hosts (Render)
- A small helper `scripts/start.sh` is provided to run migrations at deploy, then start the Uvicorn server.
- Render can run this script as the start command so every deploy will apply migrations before the app starts.

Example Render start command:
  bash scripts/start.sh

Safety note: the migration runner backs up the DB file before applying changes. For heavy production migrations prefer a robust strategy (dump, migrate, restore on failure) or use Alembic.
