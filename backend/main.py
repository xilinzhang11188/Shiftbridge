from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, clients, workers, shifts, services, notifications

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShiftBridge API",
    description="Healthcare Staffing & Scheduling Platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(workers.router, prefix="/api/workers", tags=["Workers"])
app.include_router(shifts.router, prefix="/api/shifts", tags=["Shifts"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.get("/")
async def root():
    return {
        "message": "ShiftBridge API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )