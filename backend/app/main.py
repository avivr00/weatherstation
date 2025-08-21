
from fastapi import FastAPI, Response
from starlette.middleware.cors import CORSMiddleware
from app.api.auth.routes import router as api_router
from app.db.session import engine
from app.db.base import Base
from app.db.models import *

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware - allow requests from any origin (development only!)
# WARNING: This allows ALL origins - use specific origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
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

app.include_router(api_router, prefix="/api/auth")

@app.get("/")
def root():
    return Response(status_code=303, headers={"Location": "/docs"}) # Redirect to API docs

