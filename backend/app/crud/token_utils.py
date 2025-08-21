from app.db.models.users_ORM import UserORM
from sqlalchemy import select
from sqlalchemy.orm import Session
import jwt
from datetime import datetime, timedelta, timezone
from decouple import config


SECRET_KEY = str(config("JWT_SECRET_KEY", default="not very secret"))
ALGORITHM = str(config("JWT_ALGORITHM", default="HS256"))
DAYS_LOGGED_IN = int(config("DAYS_LOGGED_IN", default=7))

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=DAYS_LOGGED_IN)):
    to_encode = data.copy()
    # use timezone-aware UTC datetime to avoid deprecation warnings
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def validate_access_token(token: str) -> dict:
    try:
        # Add debug logging
        print(f"[TOKEN_VALIDATION] Received token: '{token}' (length: {len(token)})")
        
        # Check if token has the basic JWT structure
        if not token or token.count('.') != 2:
            print(f"[TOKEN_VALIDATION] Invalid token format - expected 3 parts separated by dots, got: {token.count('.') + 1} parts")
            raise ValueError("Invalid token format")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"[TOKEN_VALIDATION] Successfully decoded token payload: {payload}")
        return payload
    except jwt.ExpiredSignatureError:
        print("[TOKEN_VALIDATION] Token has expired")
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        print(f"[TOKEN_VALIDATION] Invalid token error: {e}")
        raise ValueError("Invalid token")
    except Exception as e:
        print(f"[TOKEN_VALIDATION] Unexpected error: {e}")
        raise ValueError("Token validation failed")

def validate_user_from_token(token: str, db: Session) -> UserORM | None:
    token_data: dict = validate_access_token(token)
    email = token_data.get("email") if token_data else None
    token_version = token_data.get("token_version") if token_data else None
    user = db.execute(select(UserORM).where(UserORM.email == email)).scalar_one_or_none()
    if user is None:
        return None
    # Ensure token_version matches user's current token_version
    if token_version is None or getattr(user, "token_version", None) != token_version:
        return None
    return user

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
