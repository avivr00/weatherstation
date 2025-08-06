
from app.db.session import SessionLocal
from app.db.models.hourORM import WeatherDataHourORM

def seed_hours():
    db = SessionLocal()
    for i in range(24):
        hour_str = f"{i:02}:00"
        db.add(WeatherDataHourORM(hour=hour_str, value=i * 10))
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_hours()
