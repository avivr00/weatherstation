from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class EventORM(Base):
    """A class to represent the events table as a SQLAlchemy model"""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    date_time = Column(DateTime, nullable=False)
    user_email = Column(String, ForeignKey("users.email"), nullable=False)

    # Relationship to user
    user = relationship("UserORM", back_populates="events")
