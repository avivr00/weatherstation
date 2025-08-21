# Pydantic models for API response schemas

from pydantic import BaseModel, ConfigDict
from typing import Dict, Optional, List
from datetime import datetime

# Request models
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class EventRequest(BaseModel):
    title: str
    description: Optional[str] = None
    date_time: datetime

class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date_time: Optional[datetime] = None

# Response models
class GenericResponseModel(BaseModel):
    """Generic response model for API responses"""
    message: str
    data: Optional[Dict] = None
    error: Optional[str] = None

# we use a generic message format for all endpoints

class RegisterResponseModel(GenericResponseModel):
    """Response model for user registration"""
    
class LoginResponseModel(GenericResponseModel):
    """Response model for user login"""
    
class LogoutResponseModel(GenericResponseModel):
    """Response model for user logout"""
    
class ValidateResponseModel(GenericResponseModel):
    """Response model for validating API token"""

# Event response models
class EventResponseModel(GenericResponseModel):
    """Response model for event operations"""
    pass

class EventListResponseModel(GenericResponseModel):
    """Response model for listing events"""
    pass
    