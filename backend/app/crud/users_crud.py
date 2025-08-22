# implement the various CRUD actions we need for managing users
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.schemas.response_models import *
from app.db.models.users_ORM import UserORM
from app.crud.token_utils import create_access_token, validate_user_from_token


def login_api_user(email: str, password: str, db: Session) -> LoginResponseModel:
    """Endpoint to login and return a JWT accesss token in the response"""
    assert(password is not None and email is not None)
    
    user = db.execute(select(UserORM).where(UserORM.email == email)).scalar_one_or_none()
    if user is None or getattr(user, "password", None) != password:
        return LoginResponseModel(message="Invalid email or password", data=None, error="Invalid credentials")
    # include token_version to support token revocation/versioning
    access_token = create_access_token(data={'email': user.email, 'token_version': getattr(user, 'token_version', 0)})
    return LoginResponseModel(message="Login successful", data={"access_token": access_token, "token_type": "bearer"}, error=None)


def logout_api_user(token: str, db: Session) -> LogoutResponseModel:
    """Endpoint to logout the user this token belongs to"""
    user = validate_user_from_token(token, db)
    if user is None:
        return LogoutResponseModel(message="Invalid token.", error="User not found or inactive")
    # We increment token_version to invalidate previously issued tokens
    try:
        current = getattr(user, "token_version", 0) or 0
        setattr(user, "token_version", current + 1)
        db.add(user)
        db.commit()
    except Exception:
        return LogoutResponseModel(message="Logout failed", error="Could not update token version")
    return LogoutResponseModel(message="Logout successful")
    

def register_api_user(first_name: str, last_name: str, email: str, password: str, db: Session):
    """Endpoint to register a new user"""
    # Check if user exists
    user = db.execute(select(UserORM).where(UserORM.email == email)).scalar_one_or_none()
    if user:
        return RegisterResponseModel(message="User already exists", error="Email already registered")
    # Create new user
    new_user = UserORM(
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # Create bearer token
    # include token_version on creation (defaults to 0)
    token = create_access_token({"email": email, "token_version": getattr(new_user, 'token_version', 0)})
    return RegisterResponseModel(message="User registered successfully",
                                 data={"access_token": token, "token_type": "bearer"})


def validate_api_token(token: str, db: Session) -> ValidateResponseModel:
    """Endopint that validates the provided API token."""
    try:
        user = validate_user_from_token(token, db)
        if user is None:
            return ValidateResponseModel(message="Invalid token", error="token failed validation")
        return ValidateResponseModel(message="Valid token", data={"email": user.email, "first_name": user.first_name, "last_name": user.last_name})
    except Exception:
        return ValidateResponseModel(message="Invalid token", error="Token validation failed")

