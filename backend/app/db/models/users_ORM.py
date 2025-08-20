from sqlalchemy import Column, String, Integer
from app.db.base import Base

class UserORM(Base):
    """A class to represent the users table as a SQLAlchemy model"""
    __tablename__ = "users"

    email = Column(String, unique=True, primary_key=True, index=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    password = Column(String, nullable=False)
    # Increment this to invalidate previously issued tokens for the user
    token_version = Column(Integer, default=0, nullable=False)
