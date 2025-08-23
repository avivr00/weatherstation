from fastapi import APIRouter, Depends, HTTPException, Header, status, Request
from sqlalchemy.orm import Session
from app.schemas.response_models import EventResponseModel, EventListResponseModel, EventRequest, EventUpdateRequest
from app.db.session import get_db
from app.crud.events_crud import create_event, get_user_events, get_event_by_id, update_event, delete_event
from backend.app.utils.token_utils import extract_bearer_token


router = APIRouter()


def check_error(res):
    if res.error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res.error)
    return res


@router.post("/events", response_model=EventResponseModel)
async def create_user_event(
    request: Request,
    event_data: EventRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new event for the authenticated user"""
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    
    res = create_event(event_data.title, event_data.description, event_data.date_time, token, db)
    return check_error(res)


@router.get("/events", response_model=EventListResponseModel)
def get_events(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get all events for the authenticated user"""
    # Extract token
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    
    res = get_user_events(token, db)
    return check_error(res)


@router.get("/events/{event_id}", response_model=EventResponseModel)
def get_event(
    event_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get a specific event by ID"""
    # Extract token
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    
    res = get_event_by_id(event_id, token, db)
    return check_error(res)


@router.put("/events/{event_id}", response_model=EventResponseModel)
async def update_user_event(
    event_id: int,
    request: Request,
    event_data: EventUpdateRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update an existing event"""
    # Print request details for debugging
    body = await request.body()
    # Extract token
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    
    res = update_event(event_id, event_data.title, event_data.description, event_data.date_time, token, db)
    return check_error(res)


@router.delete("/events/{event_id}", response_model=EventResponseModel)
def delete_user_event(
    event_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete an event"""
    # Extract token
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    
    res = delete_event(event_id, token, db)
    return check_error(res)
