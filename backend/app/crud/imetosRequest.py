#import time
import json
from datetime import datetime
#from dateutil.tz import tzlocal
from Crypto.Hash import HMAC
from Crypto.Hash import SHA256
import requests
from requests.auth import AuthBase
from decouple import config


class AuthHmacMetosGet(AuthBase):
    """ Class to perform HMAC encoding.
        Creates HMAC authorization header for Metos REST service GET request.
        https://api.fieldclimate.com/v2/docs/#data-get-last-data-customized """

    def __init__(self, api_route, public_key, private_key):
        self._public_key = public_key
        self._private_key = private_key
        self._method = 'GET'
        self._api_route = api_route

    def __call__(self, request):
        date_stamp = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
        request.headers['Date'] = date_stamp
        msg = (self._method + self._api_route + date_stamp +
                self._public_key).encode(encoding='utf-8')
        h = HMAC.new(self._private_key.encode(encoding='utf-8'), msg, SHA256)
        signature = h.hexdigest()
        request.headers['Authorization'] = 'hmac ' + self._public_key + ':' + signature
        return request


class ImetosRequest():
    """ Perform requests to imetos/fieldclimate REST api. """
    def __init__(self, grouping):
        self._api_uri = config('IMETOS_API_URI')
        # HMAC Authentication credentials:
        self._public_key = config('IMETOS_PUBLIC_KEY')
        self._private_key = config('IMETOS_PRIVATE_KEY')
        self._station_id = config('IMETOS_STATION_ID')
        assert grouping in ['hourly', 'daily', 'monthly']
        self._grouping = grouping

    def get(self, api_route):
        """ Perform the actual request """
        auth = AuthHmacMetosGet(api_route, self._public_key, self._private_key)
        response = requests.get(url=self._api_uri+api_route,
                                    headers={'Accept': 'application/json'},
                                    auth=auth,
                                    timeout=10.0)
        response.raise_for_status()
        res = response.json()
        return res

    def get_data(self, t_from, t_to):
        """ Get station data in a date range, with the specified grouping (hourly/daily/monthly.) """
        #apiRoute = f'/data/{STATION_ID}/hourly/last/24h'
        #apiRoute = f'/chart/images/{STATION_ID}/hourly/last/24'
        api_route = f'/data/{self._station_id}/{self._grouping}/from/{t_from}/to/{t_to}'
        return self.get(api_route)

    def get_data_availability(self):
        """ Will result in a dictionary with keys of min_date and max_date of data availability """
        api_route = f'/data/{self._station_id}'
        return self.get(api_route)

    @staticmethod
    def by_date(by_sensor):
        """consume a dict of data points by sensor, return a dict of sensor datas by date"""
        rows = {}
        rows_n = 0
        for date in by_sensor['dates']:
            rows[date] = {}
            for sensor in by_sensor['data']:
                sensor_name = ''
                if 'name_original' in sensor:
                    sensor_name = sensor['name_original']
                elif 'name' in sensor:
                    sensor_name = sensor['name']
                else:
                    continue
                for aggr in sensor['values']:
                    rows[date][sensor_name + '|' + aggr] = sensor['values'][aggr][rows_n]
            rows_n += 1
        return rows


# r = imetosRequest('hourly')
# j = r.getData(int(time.time()) - 7200, int(time.time()))
# #print(json.dumps(j))
# print(json.dumps(r.by_date(j), indent=4))
