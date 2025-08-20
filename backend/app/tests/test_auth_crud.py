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

def register_user(email: str, password: str, first_name: str = "First", last_name: str = "Last"):
    params = {"first_name": first_name, "last_name": last_name, "email": email, "password": password}
    return client.post("/api/auth/register", params=params)

def login_user(email: str, password: str):
    params = {"email": email, "password": password}
    return client.post("/api/auth/login", params=params)

def validate_token(token: str):
    return client.post("/api/auth/validate", params={"token": token})

def logout_token(token: str):
    return client.post("/api/auth/logout", params={"token": token})

def test_register_and_login_success():
    email = "crud.user@example.com"
    password = "password123"

    # Register
    r = register_user(email, password)
    assert r.status_code == 200
    data = r.json()
    assert data["message"] == "User registered successfully"
    assert "access_token" in data["data"]

    # Login
    r = login_user(email, password)
    assert r.status_code == 200
    data = r.json()
    assert data["message"] == "Login successful"
    assert "access_token" in data["data"]

def test_login_fails_with_wrong_password():
    email = "crud.fail@example.com"
    password = "rightpass"
    wrong = "wrongpass"

    # Register
    r = register_user(email, password)
    assert r.status_code == 200

    # Wrong password
    r = login_user(email, wrong)
    assert r.status_code == 401

def test_register_duplicate_fails():
    email = "crud.dup@example.com"
    password = "dupsecret"

    r = register_user(email, password)
    assert r.status_code == 200

    r = register_user(email, password)
    assert r.status_code == 401

def test_validate_with_bad_token():
    r = validate_token("this.is.not.a.valid.token")
    assert r.status_code == 401

