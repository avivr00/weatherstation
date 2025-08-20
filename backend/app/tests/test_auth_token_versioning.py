import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.db.session import get_db
import importlib
importlib.import_module("app.db.models.users_ORM")

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
# Use StaticPool so the in-memory DB is shared across connections used by the test client
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables in the test DB
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_token_versioning_flow():
    # Register a new user
    params = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test.token@example.com",
        "password": "supersecret",
    }
    r = client.post("/api/auth/register", params=params)
    assert r.status_code == 200
    data = r.json()
    assert data["message"] == "User registered successfully"
    token = data["data"]["access_token"]

    # Validate token (should be valid)
    r = client.post("/api/auth/validate", params={"token": token})
    assert r.status_code == 200
    assert r.json()["message"] == "Valid token"

    # Logout (this should increment token_version)
    r = client.post("/api/auth/logout", params={"token": token})
    assert r.status_code == 200
    assert r.json()["message"] == "Logout successful"

    # Old token should now be invalid
    r = client.post("/api/auth/validate", params={"token": token})
    assert r.status_code == 401


def test_new_token_after_logout_is_valid_and_old_is_invalid():
    email = "reissue.token@example.com"
    password = "reissuepass"

    # Register
    params = {"first_name": "Re", "last_name": "Issue", "email": email, "password": password}
    r = client.post("/api/auth/register", params=params)
    assert r.status_code == 200
    token1 = r.json()["data"]["access_token"]

    # Validate token1 is valid
    r = client.post("/api/auth/validate", params={"token": token1})
    assert r.status_code == 200

    # Logout using token1 -> increments token_version
    r = client.post("/api/auth/logout", params={"token": token1})
    assert r.status_code == 200

    # Old token should now be invalid
    r = client.post("/api/auth/validate", params={"token": token1})
    assert r.status_code == 401

    # Login again to get a fresh token (token2)
    r = client.post("/api/auth/login", params={"email": email, "password": password})
    assert r.status_code == 200
    token2 = r.json()["data"]["access_token"]

    # New token should be valid
    r = client.post("/api/auth/validate", params={"token": token2})
    assert r.status_code == 200
