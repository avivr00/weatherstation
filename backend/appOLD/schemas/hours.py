
from pydantic import BaseModel

class HourBase(BaseModel):
    name: str
    description: str


class HourRead(BaseModel):
    id: int
    hour: str
    value: int

    class Config:
        orm_mode = True
        