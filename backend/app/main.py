
from fastapi import FastAPI
from app.api.v1.routes import router as api_router
from app.db.session import engine
from app.db.base import Base
from app.db.models import *

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "FastAPI with SQLAlchemy Starter"} # TODO: redirect to docs
