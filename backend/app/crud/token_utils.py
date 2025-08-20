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
    print(to_encode)
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def validate_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

def validate_user_from_token(token: str, db: Session) -> UserORM | None:
    token_data: dict = validate_access_token(token)
    print(token_data)
    email = token_data.get("email") if token_data else None
    token_version = token_data.get("token_version") if token_data else None
    user = db.execute(select(UserORM).where(UserORM.email == email)).scalar_one_or_none()
    if user is None:
        return None
    # Ensure token_version matches user's current token_version
    if token_version is None or getattr(user, "token_version", None) != token_version:
        return None
    return user
