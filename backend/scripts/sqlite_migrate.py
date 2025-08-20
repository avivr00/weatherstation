#!/usr/bin/env python3
"""
Lightweight SQLite migration runner using PRAGMA user_version.
Usage:
  python scripts/sqlite_migrate.py --db test.db

Behavior:
- Creates a backup of the DB file before applying any migrations.
- Reads PRAGMA user_version and applies migrations with a higher version.
- Each migration entry is a list of SQL statements applied in a transaction.
- Ignores OperationalError for idempotent/additive operations (e.g. column already exists).

Add new migrations to the MIGRATIONS dict using increasing integer keys.
"""

from pathlib import Path
import sqlite3
import argparse
import shutil
import sys
import textwrap

# --- Define migrations here ---
# Each migration is a list of SQL statements that move the schema to that version.
# Use small, additive SQL statements where possible.
MIGRATIONS = {
    1: [
        # Add token_version to users (idempotent-ish: ADD COLUMN will fail if column exists, but we'll continue)
        "ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0 NOT NULL;"
    ],
    # Example future migration:
    # 2: [
    #     "CREATE TABLE new_table (id INTEGER PRIMARY KEY, name TEXT NOT NULL);",
    # ],
}


def get_user_version(conn: sqlite3.Connection) -> int:
    cur = conn.execute("PRAGMA user_version;")
    row = cur.fetchone()
    return int(row[0]) if row else 0


def set_user_version(conn: sqlite3.Connection, version: int) -> None:
    conn.execute(f"PRAGMA user_version = {version};")


def apply_migration(conn: sqlite3.Connection, statements):
    for sql in statements:
        sql = sql.strip()
        if not sql:
            continue
        try:
            conn.execute(sql)
            print("  OK:", sql)
        except sqlite3.OperationalError as e:
            # This happens if, e.g., the column already exists. Log and continue so migrations are idempotent.
            print("  OperationalError (continuing):", e)
        except Exception:
            # Bubble up other exceptions
            raise


def backup_db(db_path: Path) -> Path:
    backup_path = db_path.with_suffix(db_path.suffix + ".bak")
    shutil.copy2(db_path, backup_path)
    return backup_path


def run_migrations(db_path: Path, dry_run: bool = False) -> None:
    if not db_path.exists():
        print(f"DB file not found at {db_path}")
        sys.exit(1)

    print(f"DB: {db_path}")
    print("Backing up DB...")
    backup = backup_db(db_path)
    print(f"Backup created at: {backup}")

    conn = sqlite3.connect(str(db_path))
    try:
        conn.isolation_level = None  # we'll control transactions with BEGIN/COMMIT
        cur_ver = get_user_version(conn)
        print("Current user_version:", cur_ver)

        target_versions = sorted(v for v in MIGRATIONS.keys() if v > cur_ver)
        if not target_versions:
            print("No migrations to apply.")
            return

        for v in target_versions:
            print(f"Applying migration {v}...")
            if dry_run:
                print("  Dry run: the following statements would be executed:")
                for s in MIGRATIONS[v]:
                    print(textwrap.indent(s.strip(), "    "))
                continue

            try:
                conn.execute("BEGIN;")
                apply_migration(conn, MIGRATIONS[v])
                set_user_version(conn, v)
                conn.execute("COMMIT;")
                print(f"Migration {v} applied successfully.")
            except Exception as e:
                conn.execute("ROLLBACK;")
                print(f"Failed to apply migration {v}:", e)
                print("Restoring from backup and exiting.")
                shutil.copy2(backup, db_path)
                sys.exit(2)
    finally:
        conn.close()


def parse_args():
    p = argparse.ArgumentParser(description="Lightweight SQLite migration runner (PRAGMA user_version)")
    p.add_argument("--db", default="test.db", help="Path to SQLite DB file")
    p.add_argument("--dry-run", action="store_true", help="Show migrations that would run without applying")
    return p.parse_args()


def main():
    args = parse_args()
    db_path = Path(args.db)
    run_migrations(db_path, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
