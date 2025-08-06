from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Dict, Optional

class HourResponseModel(BaseModel):
    #model_config = ConfigDict(from_attributes=True)
    
    timestamp: int
    temp: float
    humidity: float
    precip: float
    wind_speed_avg: float
    wind_speed_max: float
    
    

class HoursResponseModel(BaseModel):
    #model_config = ConfigDict(from_attributes=True)
    
    hours: Dict[int, Optional[HourResponseModel]]

    