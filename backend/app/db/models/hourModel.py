
from sqlalchemy import Column, Integer, String, DateTime, Float
from app.db.base import Base
from app.crud.imetosRequest import ImetosRequest


class WeatherData(Base):
    """Abstract model for weather station data - base class"""
    __abstract__ = True

    datetime = Column(DateTime, primary_key=True, index=True)

    SENSORS = {
        "temp_avg":         { "name": "HC Air temperature|avg",     "unit": "(C°)" },
        "temp_min":         { "name": "HC Air temperature|min",     "unit": "(C°)" },
        "temp_max":         { "name": "HC Air temperature|max",     "unit": "(C°)" },
        "humidity":         { "name": "HC Relative humidity|avg",   "unit": "(%)" },
        "precip":           { "name": "Precipitation|sum",          "unit": "(mm)" },
        "solar_rad":        { "name": "Solar radiation|avg",        "unit": "(W/m²)" },
        "wind_speed_avg":   { "name": "Wind speed|avg",             "unit": "(m/s)" },
        "wind_speed_max":   { "name": "Wind speed|max",             "unit": "(m/s)" },
        "dew_point_avg":    { "name": "Dew Point|avg",              "unit": "(C°)" },
        "dew_point_min":    { "name": "Dew Point|min",              "unit": "(C°)" } }

    @classmethod
    def sensor_names_to_model_fields(cls, row, wanted_fields):
        """static method that extracts wanted data from api response"""
        res = {}
        for field in row:
            for model_field, field_props in cls.SENSORS.items():
                if ('name', field) in field_props.items():
                    if model_field in wanted_fields:
                        res[model_field] = row[field]
                    break
        return res


class WeatherDataHour(WeatherData):
    """ Model for WeatherData grouped by hours """
    __tablename__ = "hours"
    temp = Column(Float)
    humidity = Column(Float)
    precip = Column(Float)
    wind_speed_avg = Column(Float)
    wind_speed_max = Column(Float)

    @staticmethod
    def imetos_request_factory():
        """Create a new imetosRequest for this model's period grouping"""
        return ImetosRequest('hourly')

    def __repr__(self):
        return f"<WeatherDataHour(datetime={self.datetime}, temp_avg={self.temp}, humidity={self.humidity}, precip={self.precip}, wind_speed_avg={self.wind_speed_avg})>"


'''
# django - specific

class WeatherDataManager(models.Manager):
    """Model manager for WeatherData"""
    def get_data_remote(self, t_from:int, t_to:int):
        """Blocking request data from imetos (remote) api, returns list of WeatherData objects"""
        req = self.model.imetos_request_factory()
        # perform the blocking request:
        res = req.get_data(t_from, t_to)
        rows = ImetosRequest.by_date(res)
        object_list = []
        #iterate over result, create object list:
        for date, row in rows.items():
            field_names = [field.name for field in self.model._meta.get_fields()]
            row = self.model.sensor_names_to_model_fields(row, field_names)
            row['date'] = date
            period = self.model(**row)
            object_list.append(period)
        return object_list


    def get_data_local(self, t_from:int, t_to:int):
        """perform a db query and return list of WeatherData objects"""
'''
