
from sqlalchemy import Column, Integer, String
from app.db.base import Base

class HourData(Base):
    __tablename__ = "hours"

    id = Column(Integer, primary_key=True, index=True)
    hour = Column(String, index=True)     # e.g., "01:00", "02:00"
    value = Column(Integer)               # or Float/Str/whatever
