"""
Weather API proxy routes
Handles weather API requests to avoid CORS issues in frontend
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["weather"])

# Open-Meteo API configuration
WEATHER_BASE_URL = "https://api.open-meteo.com/v1"
GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1"

@router.get("/weather/search")
async def search_locations(
    q: str = Query(..., description="Search query for location"),
    count: int = Query(10, description="Number of results to return", le=100)
):
    """
    Search for locations using Open-Meteo Geocoding API
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GEOCODING_BASE_URL}/search",
                params={
                    "name": q,
                    "count": count,
                    "language": "en",
                    "format": "json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Geocoding API error: {response.text}"
                )
                
            return response.json()
            
    except httpx.RequestError as e:
        logger.error(f"Network error during location search: {e}")
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error during location search: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/weather/current")
async def get_current_weather(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    temperature_unit: str = Query("celsius", description="Temperature unit"),
    wind_speed_unit: str = Query("kmh", description="Wind speed unit")
):
    """
    Get current weather by coordinates using Open-Meteo API
    """
    try:
        current_params = [
            "temperature_2m",
            "relative_humidity_2m", 
            "apparent_temperature",
            "is_day",
            "precipitation",
            "rain",
            "showers", 
            "snowfall",
            "weather_code",
            "cloud_cover",
            "pressure_msl",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m"
        ]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WEATHER_BASE_URL}/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": ",".join(current_params),
                    "temperature_unit": temperature_unit,
                    "wind_speed_unit": wind_speed_unit,
                    "timezone": "auto"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Weather API error: {response.text}"
                )
                
            return response.json()
            
    except httpx.RequestError as e:
        logger.error(f"Network error during weather request: {e}")
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error during weather request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/weather/forecast")
async def get_weather_forecast(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    days: int = Query(7, description="Number of forecast days", le=16),
    temperature_unit: str = Query("celsius", description="Temperature unit"),
    wind_speed_unit: str = Query("kmh", description="Wind speed unit")
):
    """
    Get weather forecast by coordinates using Open-Meteo API
    """
    try:
        daily_params = [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "apparent_temperature_max",
            "apparent_temperature_min",
            "sunrise",
            "sunset",
            "daylight_duration",
            "sunshine_duration",
            "uv_index_max",
            "precipitation_sum",
            "rain_sum",
            "showers_sum",
            "snowfall_sum",
            "precipitation_hours",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "wind_gusts_10m_max",
            "wind_direction_10m_dominant",
            "shortwave_radiation_sum"
        ]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WEATHER_BASE_URL}/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "daily": ",".join(daily_params),
                    "temperature_unit": temperature_unit,
                    "wind_speed_unit": wind_speed_unit,
                    "timezone": "auto",
                    "forecast_days": days
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Weather API error: {response.text}"
                )
                
            return response.json()
            
    except httpx.RequestError as e:
        logger.error(f"Network error during forecast request: {e}")
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error during forecast request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
