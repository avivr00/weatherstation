
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.models.hourORM import WeatherDataHourORM
from app.schemas.hour import HourResponseModel, HoursResponseModel
from decouple import config
import time
from datetime import datetime

def get_hours(db: Session, offset: int = 0, count: int = 24):
    now = int(time.time())
    t_from = offset_to_timestamp(offset + count, 'hour', now)
    t_to = offset_to_timestamp(offset, 'hour', now)
    # create a dict with placeholders for all hours in the range
    hours_dict = {hour: None for hour in genenerate_timestamps(t_from, t_to, 'hour')}
    
    # load data from local db:
    #statement = select(WeatherDataHourORM) \
    #    .where(WeatherDataHourORM.datetime > t_from, WeatherDataHourORM.datetime < t_to) \
    #    .order_by(WeatherDataHourORM.datetime)
    #for line in db.scalars(statement):
    #    hour = int(line.datetime.timestamp())
    #    if hour in hours:
    #        hours[hour] = line
    
    hours_model = HoursResponseModel(hours = {})
    match config('DATA_SOURCE', default='mock'):
        case 'mock':
            # For testing/demonstaration, genrate mock weather data
            for timestamp, data in hours_dict.items():
                if data is None:
                    h = HourResponseModel(
                        timestamp = timestamp,
                        temp = 20 + (timestamp % 3600) / 120,           # Mock temperature
                        humidity = 50 + (timestamp % 3600) / 120,       # Mock humidity
                        precip = (timestamp % 3600) / 60,               # Mock precipitation
                        wind_speed_avg = (timestamp % 10) * 2,          # Mock wind speed 
                        wind_speed_max = (timestamp % 10) * 3           # Mock max wind speed
                    )
                    hours_model.hours[timestamp] = HourResponseModel.model_validate(h)
        case 'imetos':
            # Fetch remote data from Imetos API
            #imetos_request = WeatherDataHour.imetos_request_factory()
            #remote_hours = imetos_request.get_data(t_from, t_to)
            #for timestamp, data in remote_hours.items():
            #    if timestamp in hours:
            #        hours[timestamp] = WeatherDataHour(
            #            datetime = time.localtime(timestamp),
            #            temperature = data.get('temperature', 0),
            #            humidity = data.get('humidity', 0),
            #            wind_speed = data.get('wind_speed', 0),
            #
            pass

    h = HoursResponseModel.model_validate(hours_model)
    return h


def genenerate_timestamps(t_from: int, t_to: int, interval: str):
    """ generate a list of timestamps from t_from to t_to, inclusive, at interval """
    period: int = 0
    match interval:
        case 'hour':
            period = 60 * 60
        case 'day':
            period = 60 * 60 * 24
    return range(t_from, t_to, period)

def offset_to_timestamp(offset: int, interval: str, from_timestamp: int) -> int:
    """ Find the timestamp for the given offset and interval from a base timestamp """
    match interval:
        case 'hour':
            return from_timestamp - (offset * 60 * 60)
        case 'day':
            return from_timestamp - (offset * 60 * 60 * 24)
    return from_timestamp