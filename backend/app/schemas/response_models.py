# Pydantic models for API response schemas

from pydantic import BaseModel, ConfigDict
from typing import Dict, Optional

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
    