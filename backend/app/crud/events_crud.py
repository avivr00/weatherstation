# CRUD operations for events
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.schemas.response_models import *
from app.db.models.events_ORM import EventORM
from app.db.models.users_ORM import UserORM
from app.utils.token_utils import validate_user_from_token
from datetime import datetime
from typing import List, Optional


def create_event(title: str, description: Optional[str], date_time: datetime, token: str, db: Session) -> EventResponseModel:
    """Create a new event for the authenticated user"""
    # Validate user from token
    user = validate_user_from_token(token, db)
    if user is None:
        return EventResponseModel(message="Invalid token", error="User not found or token invalid")
    
    try:
        # Create new event
        new_event = EventORM(
            title=title,
            description=description,
            date_time=date_time,
            user_email=user.email
        )
        db.add(new_event)
        db.commit()
        db.refresh(new_event)
        
        return EventResponseModel(
            message="Event created successfully",
            data={
                "id": new_event.id,
                "title": new_event.title,
                "description": new_event.description,
                "date_time": new_event.date_time.isoformat(),
                "user_email": new_event.user_email
            }
        )
    except Exception as e:
        return EventResponseModel(message="Failed to create event", error=str(e))


def get_user_events(token: str, db: Session) -> EventListResponseModel:
    """Get all events for the authenticated user"""
    # Validate user from token
    user = validate_user_from_token(token, db)
    if user is None:
        return EventListResponseModel(message="Invalid token", error="User not found or token invalid")
    
    try:
        # Get all events for this user
        events = db.execute(select(EventORM).where(EventORM.user_email == user.email)).scalars().all()
        
        events_data = []
        for event in events:
            events_data.append({
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "date_time": event.date_time.isoformat(),
                "user_email": event.user_email
            })
        
        return EventListResponseModel(
            message=f"Found {len(events_data)} events",
            data={"events": events_data}
        )
    except Exception as e:
        return EventListResponseModel(message="Failed to get events", error=str(e))


def get_event_by_id(event_id: int, token: str, db: Session) -> EventResponseModel:
    """Get a specific event by ID (only if user owns it)"""
    # Validate user from token
    user = validate_user_from_token(token, db)
    if user is None:
        return EventResponseModel(message="Invalid token", error="User not found or token invalid")
    
    try:
        # Get event by ID and ensure it belongs to the user
        event = db.execute(
            select(EventORM).where(
                EventORM.id == event_id,
                EventORM.user_email == user.email
            )
        ).scalar_one_or_none()
        
        if event is None:
            return EventResponseModel(message="Event not found", error="Event not found or not accessible")
        
        return EventResponseModel(
            message="Event found",
            data={
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "date_time": event.date_time.isoformat(),
                "user_email": event.user_email
            }
        )
    except Exception as e:
        return EventResponseModel(message="Failed to get event", error=str(e))


def update_event(event_id: int, title: Optional[str], description: Optional[str], 
                date_time: Optional[datetime], token: str, db: Session) -> EventResponseModel:
    """Update an event (only if user owns it)"""
    # Validate user from token
    user = validate_user_from_token(token, db)
    if user is None:
        return EventResponseModel(message="Invalid token", error="User not found or token invalid")
    
    try:
        # Get event by ID and ensure it belongs to the user
        event = db.execute(
            select(EventORM).where(
                EventORM.id == event_id,
                EventORM.user_email == user.email
            )
        ).scalar_one_or_none()
        
        if event is None:
            return EventResponseModel(message="Event not found", error="Event not found or not accessible")
        
        # Update fields if provided
        if title is not None:
            setattr(event, "title", title)
        if description is not None:
            setattr(event, "description", description)
        if date_time is not None:
            setattr(event, "date_time", date_time)
        
        db.commit()
        db.refresh(event)
        
        return EventResponseModel(
            message="Event updated successfully",
            data={
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "date_time": event.date_time.isoformat(),
                "user_email": event.user_email
            }
        )
    except Exception as e:
        return EventResponseModel(message="Failed to update event", error=str(e))


def delete_event(event_id: int, token: str, db: Session) -> EventResponseModel:
    """Delete an event (only if user owns it)"""
    # Validate user from token
    user = validate_user_from_token(token, db)
    if user is None:
        return EventResponseModel(message="Invalid token", error="User not found or token invalid")
    
    try:
        # Get event by ID and ensure it belongs to the user
        event = db.execute(
            select(EventORM).where(
                EventORM.id == event_id,
                EventORM.user_email == user.email
            )
        ).scalar_one_or_none()
        
        if event is None:
            return EventResponseModel(message="Event not found", error="Event not found or not accessible")
        
        db.delete(event)
        db.commit()
        
        return EventResponseModel(
            message="Event deleted successfully",
            data={"deleted_event_id": event_id}
        )
    except Exception as e:
        return EventResponseModel(message="Failed to delete event", error=str(e))
