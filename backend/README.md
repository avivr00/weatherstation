# FastAPI + SQLAlchemy Project

Folder structure:

app/
    api/            # API endpoints router
    crud/           # logic for interacting with the database via SQLAlchemy
    db/             # DB setup
        models/     # SQLAlchemy ORM table definitions
    schemas/        # Pydantic models that define request and response shapes

To run test server:
$ uvicorn app.main:app --reload