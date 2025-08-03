
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.schemas.hour import HourResponse
from app.db.session import get_db
from app.crud.hours_crud import get_hours

router = APIRouter()

@router.get("/hours", response_model=List[HourResponse])
def read_hours(offset: int = Query(0, ge=0),
                     count: int = Query(24, ge=1, le=100),
                     db: Session = Depends(get_db)):
    return get_hours(db, offset=offset, count=count)
