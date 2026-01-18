from app.database import SessionLocal
from app.models.site import Site

db = SessionLocal()
sites = db.query(Site).filter(Site.client_id == 4).all()
print(f'Sites for client 4: {[(s.id, s.address) for s in sites]}')
db.close()