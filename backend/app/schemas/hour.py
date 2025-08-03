from datetime import datetime
from pydantic import BaseModel

class HourResponse(BaseModel):
    datetime: datetime
    temp: float
    humidity: float
    precip: float
    wind_speed_avg: float
    wind_speed_max: float

    class Config:
        from_attributes = True
