
from app.db.session import SessionLocal
from app.db.models.hourModel import WeatherDataHour

def seed_hours():
    db = SessionLocal()
    for i in range(24):
        hour_str = f"{i:02}:00"
        db.add(WeatherDataHour(hour=hour_str, value=i * 10))
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_hours()
