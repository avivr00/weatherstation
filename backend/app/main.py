
from fastapi import FastAPI, Response
from starlette.middleware.cors import CORSMiddleware
from app.api.auth.routes import router as auth_router
from app.api.events.routes import router as events_router
from app.api.weather.routes import router as weather_router
from app.db.session import engine
from app.db.base import Base
from app.db.models import *

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware - some origins otherwise not allowed
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="http://127.0.0.1:.*|https://weatherstation-bm81.onrender.com/.*",  # Allow specific origins
    #allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "*"
    ],
)

app.include_router(auth_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(weather_router, prefix="/api")

@app.get("/")
def root():
    return Response(status_code=303, headers={"Location": "/docs"}) # Redirect "/" to API docs

