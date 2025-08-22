import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
from typing import Optional

from app.main import app
from app.db.base import Base
from app.db.session import get_db
import importlib

# Force import models to ensure they're registered
importlib.import_module("app.db.models.users_ORM")
importlib.import_module("app.db.models.events_ORM")

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
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

# Helper functions
def register_and_get_token(email: str, password: str, first_name: str = "Test", last_name: str = "User"):
    register_data = {"email": email, "password": password, "first_name": first_name, "last_name": last_name}
    client.post("/api/auth/register", json=register_data)
    login_data = {"email": email, "password": password}
    response = client.post("/api/auth/login", json=login_data)
    return response.json()["data"]["access_token"]

def create_event(token: str, title: str, description: Optional[str] = None, date_time: Optional[str] = None):
    event_data = {"title": title}
    if description:
        event_data["description"] = description
    if date_time:
        event_data["date_time"] = date_time
    else:
        # Provide a default datetime if not specified
        event_data["date_time"] = "2024-12-25T10:00:00+00:00"
    
    headers = {"Authorization": f"Bearer {token}"}
    return client.post("/api/events", json=event_data, headers=headers)

def get_events(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    return client.get("/api/events", headers=headers)

def get_event_by_id(token: str, event_id: int):
    headers = {"Authorization": f"Bearer {token}"}
    return client.get(f"/api/events/{event_id}", headers=headers)

def update_event(token: str, event_id: int, **updates):
    headers = {"Authorization": f"Bearer {token}"}
    return client.put(f"/api/events/{event_id}", json=updates, headers=headers)

def delete_event(token: str, event_id: int):
    headers = {"Authorization": f"Bearer {token}"}
    return client.delete(f"/api/events/{event_id}", headers=headers)


class TestEventCreation:
    def test_create_event_minimal(self):
        token = register_and_get_token("events.minimal@example.com", "password123")
        
        r = create_event(token, "Test Event")
        assert r.status_code == 200
        
        data = r.json()
        assert data["data"]["title"] == "Test Event"
        assert data["data"]["description"] is None
        assert "id" in data["data"]
        assert "date_time" in data["data"]

    def test_create_event_complete(self):
        token = register_and_get_token("events.complete@example.com", "password123")
        
        test_datetime = "2024-12-25T10:00:00+00:00"
        r = create_event(token, "Christmas Event", "Holiday celebration", test_datetime)
        assert r.status_code == 200
        
        data = r.json()
        assert data["data"]["title"] == "Christmas Event"
        assert data["data"]["description"] == "Holiday celebration"
        assert data["data"]["date_time"] == "2024-12-25T10:00:00"

    def test_create_event_no_auth(self):
        event_data = {"title": "Unauthorized Event", "date_time": "2024-12-25T10:00:00+00:00"}
        r = client.post("/api/events", json=event_data)
        assert r.status_code == 401

    def test_create_event_invalid_token(self):
        event_data = {"title": "Invalid Token Event", "date_time": "2024-12-25T10:00:00+00:00"}
        headers = {"Authorization": "Bearer invalid.token.here"}
        r = client.post("/api/events", json=event_data, headers=headers)
        assert r.status_code == 400


class TestEventRetrieval:
    def test_get_events_empty(self):
        token = register_and_get_token("events.empty@example.com", "password123")
        
        r = get_events(token)
        assert r.status_code == 200
        
        data = r.json()
        assert data["data"]["events"] == []

    def test_get_events_with_data(self):
        token = register_and_get_token("events.withdata@example.com", "password123")
        
        create_event(token, "Event 1")
        create_event(token, "Event 2")
        create_event(token, "Event 3")
        
        r = get_events(token)
        assert r.status_code == 200
        
        data = r.json()
        assert len(data["data"]["events"]) == 3
        titles = [event["title"] for event in data["data"]["events"]]
        assert "Event 1" in titles
        assert "Event 2" in titles
        assert "Event 3" in titles

    def test_get_event_by_id_success(self):
        token = register_and_get_token("events.byid@example.com", "password123")
        
        r = create_event(token, "Single Event", "Event description")
        event_id = r.json()["data"]["id"]
        
        r = get_event_by_id(token, event_id)
        assert r.status_code == 200
        
        data = r.json()
        assert data["data"]["id"] == event_id
        assert data["data"]["title"] == "Single Event"
        assert data["data"]["description"] == "Event description"


class TestEventUpdate:
    def test_update_event_title(self):
        token = register_and_get_token("events.updatetitle@example.com", "password123")
        
        r = create_event(token, "Original Title")
        event_id = r.json()["data"]["id"]
        
        r = update_event(token, event_id, title="Updated Title")
        assert r.status_code == 200
        
        data = r.json()
        assert data["data"]["title"] == "Updated Title"


class TestEventDeletion:
    def test_delete_event_success(self):
        token = register_and_get_token("events.deletesuccess@example.com", "password123")
        
        r = create_event(token, "To Delete")
        event_id = r.json()["data"]["id"]
        
        r = delete_event(token, event_id)
        assert r.status_code == 200
        
        data = r.json()
        assert data["message"] == "Event deleted successfully"
        
        r = get_event_by_id(token, event_id)
        assert r.status_code == 400
