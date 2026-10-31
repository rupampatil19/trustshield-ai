import sqlite3
import json
import bcrypt
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parent.parent / "trustshield.db"

def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                scan_id TEXT PRIMARY KEY,
                module TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                result_json TEXT NOT NULL
            )
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Create a demo user if not exists
        cursor = connection.execute("SELECT id FROM users WHERE email = 'anushka@example.com'")
        if not cursor.fetchone():
            # Using direct bcrypt instead of passlib to avoid compatibility errors
            salt = bcrypt.gensalt()
            hashed_pw = bcrypt.hashpw("password123".encode('utf-8'), salt).decode('utf-8')
            connection.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                ("Anushka Choudhari", "anushka@example.com", hashed_pw)
            )

def get_user_by_email(email):
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    return dict(row) if row else None

def create_user(name, email, password):
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, hashed_pw)
        )
        return cursor.lastrowid

def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def save_scan(scan):
    with get_connection() as connection:
        connection.execute(
            "INSERT OR REPLACE INTO scans (scan_id, module, status, result_json) VALUES (?, ?, ?, ?)",
            (scan.get("scan_id"), scan.get("module", "Unknown"), scan.get("status", "completed"), json.dumps(scan)),
        )

def get_scan(scan_id):
    with get_connection() as connection:
        row = connection.execute("SELECT result_json FROM scans WHERE scan_id = ?", (scan_id,)).fetchone()
    return json.loads(row["result_json"]) if row else None

def get_all_scans():
    with get_connection() as connection:
        rows = connection.execute("SELECT result_json, created_at FROM scans ORDER BY created_at DESC").fetchall()
    results = []
    for row in rows:
        data = json.loads(row["result_json"])
        data["_db_created_at"] = row["created_at"]
        results.append(data)
    return results