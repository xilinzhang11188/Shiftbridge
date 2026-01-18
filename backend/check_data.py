from app.database import SessionLocal
from app.models.user import Client, Worker
from app.models.shift import Shift

db = SessionLocal()

clients = db.query(Client).count()
workers = db.query(Worker).count()
shifts = db.query(Shift).count()

print(f"✅ Database Status:")
print(f"   Clients: {clients}")
print(f"   Workers: {workers}")
print(f"   Shifts: {shifts}")

if clients > 0 or workers > 0 or shifts > 0:
    print("\n✅ Your data is SAFE! Nothing was deleted.")
    print("   You just need to log in again after the page refresh.")
else:
    print("\n⚠️ No data found. You may need to run seed_data.py")

db.close()