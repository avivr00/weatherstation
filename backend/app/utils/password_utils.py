"""
Secure password handling utilities
"""

from passlib.context import CryptContext


# Configure password hashing context with bcrypt
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,  # Work factor - balance security vs performance
)


def hash_password(password: str) -> str:
    """Hash a password with bcrypt and automatic salt generation."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False
