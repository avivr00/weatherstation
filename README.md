# Weather Station with Events Planning

Final project in Advanced Subjects in Software Development.

## Frontend
Inside VSCode, Right-click `frontend/home/home.html` and select "Open with Live Server" (needs Live Server extension installed.)

## Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

## Tests
```bash
cd backend
python -m pytest
```

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5.3.3
- **Backend:** FastAPI, SQLAlchemy, SQLite, bcrypt, JWT
