
from fastapi import FastAPI, Response
from app.api.auth.routes import router as api_router
from app.db.session import engine
from app.db.base import Base
from app.db.models import *

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(api_router, prefix="/api/auth")

@app.get("/")
def root():
    return Response(status_code=303, headers={"Location": "/docs"}) # Redirect to API docs

