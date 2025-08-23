# Some helper functions for dealing with JWT tokens

from app.db.models.users_ORM import UserORM
from sqlalchemy import select
from sqlalchemy.orm import Session
import jwt
from datetime import datetime, timedelta, timezone
from decouple import config


SECRET_KEY = str(config("JWT_SECRET_KEY", default="not very secret"))
ALGORITHM = str(config("JWT_ALGORITHM", default="HS256"))
DAYS_LOGGED_IN = float(config("DAYS_LOGGED_IN", default=1))


def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=DAYS_LOGGED_IN)):
    """Create a JWT access token with the provided data and expiration."""
    to_encode = data.copy()
    # use timezone-aware UTC datetime to avoid deprecation warnings
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def validate_access_token(token: str) -> dict:
    """Validate a JWT access token and return the payload if valid."""
    try:
        # Check if token has the basic JWT structure
        if not token or token.count('.') != 2:
            raise ValueError("Invalid token format")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise ValueError("Invalid token")
    except Exception as e:
        raise ValueError("Token validation failed")


def validate_user_from_token(token: str, db: Session) -> UserORM | None:
    """Validate a JWT access token and return the associated user if valid."""
    try:
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
    except ValueError:
        # If token validation fails, return None
        return None


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
