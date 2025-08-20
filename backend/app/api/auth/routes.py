
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.response_models import RegisterResponseModel, LoginResponseModel, LogoutResponseModel, ValidateResponseModel
from app.db.session import get_db
from app.crud.crud_functions import register_api_user, login_api_user, logout_api_user, validate_api_token

router = APIRouter()

def check_error(res):
    if res.error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=res.error)
    return res

@router.post("/register", response_model=RegisterResponseModel)
def register(   first_name: str = Query(min_length=0, max_length=100),
                last_name: str = Query(min_length=0, max_length=100),
                email: str = Query(min_length=3, max_length=200),
                password: str = Query(min_length=8, max_length=100),
                db: Session = Depends(get_db)):
    """Endpoint to register a new user"""
    res = register_api_user(first_name, last_name, email, password, db)
    return check_error(res)

@router.post("/login", response_model=LoginResponseModel)
def login(  email: str = Query(min_length=1, max_length=200),
            password: str = Query(min_length=8, max_length=100),
            db: Session = Depends(get_db)):
    """Endpoint for user login"""
    res = login_api_user(email, password, db)
    return check_error(res)

@router.post("/logout", response_model=LogoutResponseModel)
def logout(    token: str = Query(min_length=1, max_length=200),
                        db: Session = Depends(get_db)):
    """Endpoint for user logout"""
    res = logout_api_user(token, db)
    return check_error(res)

@router.post("/validate", response_model=ValidateResponseModel)
def validate(   token: str = Query(min_length=1, max_length=200),
                db: Session = Depends(get_db)):
    """Endpoint to validate an API token"""
    res = validate_api_token(token, db)
    return check_error(res)

    
