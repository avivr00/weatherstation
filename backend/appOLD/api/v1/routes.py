
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.hours import ItemCreate, ItemRead
from app.crud.hours import get_item, create_item
from app.db.session import SessionLocal
from typing import List
from fastapi import Query


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/hours", response_model=List[str])
def get_hours(offset: int = Query(0, ge=0), count: int = Query(24, ge=1, le=24), db: Session = Depends(get_db)):
    db_hour = get_hours(db, offset, count)
    if db_hour is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_hour

    
