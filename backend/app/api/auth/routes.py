
from fastapi import APIRouter, Depends, Query, HTTPException, Header, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.schemas.response_models import RegisterResponseModel, LoginResponseModel, LogoutResponseModel, ValidateResponseModel, RegisterRequest, LoginRequest
from app.db.session import get_db
from app.crud.crud_functions import register_api_user, login_api_user, logout_api_user, validate_api_token
from app.crud.token_utils import extract_bearer_token

router = APIRouter()

def check_error(res):
    if res.error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=res.error)
    return res

@router.post("/auth/register", response_model=RegisterResponseModel)
async def register(request: Request, register_data: RegisterRequest, db: Session = Depends(get_db)):
    """Endpoint to register a new user"""
    res = register_api_user(register_data.first_name, register_data.last_name, 
                          register_data.email, register_data.password, db)
    return check_error(res)

@router.post("/auth/login", response_model=LoginResponseModel)
async def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    """Endpoint for user login""" 
    res = login_api_user(login_data.email, login_data.password, db)
    return check_error(res)

@router.post("/auth/logout", response_model=LogoutResponseModel)
def logout(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Endpoint for user logout — accepts token via Authorization: Bearer <token> header"""
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    res = logout_api_user(token, db)
    return check_error(res)

@router.post("/auth/validate", response_model=ValidateResponseModel)
def validate(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Endpoint to validate an API token — accepts token via Authorization: Bearer <token> header"""
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    res = validate_api_token(token, db)
    return check_error(res)

    
