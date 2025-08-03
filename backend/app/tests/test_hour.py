import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.db.models.hour import HourData

# Use a separate SQLite test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def seed_db():
    db = TestingSessionLocal()
    db.query(HourData).delete()
    for i in range(24):
        db.add(HourData(hour=f"{i:02}:00", value=i * 10))
    db.commit()
    db.close()

def test_get_hours_default():
    response = client.get("/api/v1/hours")
    assert response.status_code == 200
    assert len(response.json()) == 24

def test_get_hours_offset_count():
    response = client.get("/api/v1/hours?offset=5&count=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["hour"] == "05:00"
