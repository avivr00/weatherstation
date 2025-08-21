
from fastapi import APIRouter, Depends, Query, HTTPException, Header, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.schemas.response_models import RegisterResponseModel, LoginResponseModel, LogoutResponseModel, ValidateResponseModel, RegisterRequest, LoginRequest
from app.db.session import get_db
from app.crud.crud_functions import register_api_user, login_api_user, logout_api_user, validate_api_token

router = APIRouter()

def check_error(res):
    if res.error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=res.error)
    return res


def extract_bearer_token(authorization: str | None) -> str | None:
    """Extract the raw token from an Authorization header of form 'Bearer <token>'.
    Returns the token string or None if header is missing/invalid.
    """
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None

@router.post("/register", response_model=RegisterResponseModel)
async def register(request: Request, register_data: RegisterRequest, db: Session = Depends(get_db)):
    """Endpoint to register a new user"""
    # Print the entire request body
    print("bllash")
    body = await request.body()
    print(f"[REGISTER] Request body: {body}")
    
    # If you want to see it as a string (if it's text/JSON)
    if body:
        try:
            body_str = body.decode('utf-8')
            print(f"[REGISTER] Body as string: {body_str}")
        except UnicodeDecodeError:
            print(f"[REGISTER] Body contains binary data, length: {len(body)} bytes")
    else:
        print("[REGISTER] No request body")
    
    # Print the parsed data
    print(f"[REGISTER] Parsed data: {register_data}")
    
    res = register_api_user(register_data.first_name, register_data.last_name, 
                          register_data.email, register_data.password, db)
    return check_error(res)

@router.post("/login", response_model=LoginResponseModel)
async def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    """Endpoint for user login"""
    # Print the entire request body
    body = await request.body()
    print(f"[LOGIN] Request body: {body}")
    
    # If you want to see it as a string (if it's text/JSON)
    if body:
        try:
            body_str = body.decode('utf-8')
            print(f"[LOGIN] Body as string: {body_str}")
        except UnicodeDecodeError:
            print(f"[LOGIN] Body contains binary data, length: {len(body)} bytes")
    else:
        print("[LOGIN] No request body")
    
    # Print the parsed data
    print(f"[LOGIN] Parsed data: {login_data}")
    
    res = login_api_user(login_data.email, login_data.password, db)
    return check_error(res)

@router.post("/logout", response_model=LogoutResponseModel)
def logout(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Endpoint for user logout — accepts token via Authorization: Bearer <token> header"""
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    res = logout_api_user(token, db)
    return check_error(res)

@router.post("/validate", response_model=ValidateResponseModel)
def validate(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Endpoint to validate an API token — accepts token via Authorization: Bearer <token> header"""
    token = extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    res = validate_api_token(token, db)
    return check_error(res)

    
