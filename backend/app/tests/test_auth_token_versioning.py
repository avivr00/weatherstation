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
