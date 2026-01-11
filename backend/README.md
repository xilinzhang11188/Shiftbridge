# ShiftBridge Backend API

FastAPI-based backend for the ShiftBridge healthcare staffing and scheduling platform.

## Features

- **Multi-Role Authentication**: JWT-based authentication for Client, Worker, and Admin roles
- **Intelligent Shift Matching**: Automatic eligibility calculation based on distance, licensing, and services
- **Real-Time Notifications**: In-app notification system for shift lifecycle events
- **Multi-State Support**: Worker licensing across multiple states with validation
- **Geospatial Queries**: Distance-based worker eligibility using Google Maps API
- **Shift Management**: Complete workflow from creation to assignment with claiming system

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Primary database (SQLite for development)
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Tokens for authentication
- **Google Maps API**: Distance calculation for worker eligibility

## Setup

### Prerequisites

- Python 3.8+
- pip
- PostgreSQL (or SQLite for development)

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your settings:
   - Set `SECRET_KEY` to a secure random string
   - Add your `GOOGLE_MAPS_API_KEY`
   - Configure `DATABASE_URL` if using PostgreSQL

### Running the Server

Development mode with auto-reload:
```bash
uvicorn main:app --reload
```

Or using Python directly:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Client/Worker/Admin)
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout current user

### Clients
- `GET /api/clients` - Get all clients (Admin)
- `GET /api/clients/{id}` - Get specific client
- `POST /api/clients` - Create client (Admin)
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client (Admin)
- `GET /api/clients/{id}/sites` - Get client sites
- `POST /api/clients/{id}/sites` - Create site for client

### Workers
- `GET /api/workers` - Get all workers (Admin)
- `GET /api/workers/{id}` - Get specific worker
- `POST /api/workers` - Create worker (Admin)
- `PUT /api/workers/{id}` - Update worker
- `DELETE /api/workers/{id}` - Delete worker (Admin)
- `GET /api/workers/{id}/shifts` - Get worker's shifts
- `GET /api/workers/{id}/available-shifts` - Get eligible shifts for worker

### Shifts
- `GET /api/shifts` - Get all shifts (Admin view)
- `GET /api/shifts/{id}` - Get specific shift
- `POST /api/shifts` - Create shift (Client request or Admin)
- `PUT /api/shifts/{id}` - Update shift
- `DELETE /api/shifts/{id}` - Cancel shift
- `POST /api/shifts/{id}/claim` - Worker claims shift
- `POST /api/shifts/{id}/assign` - Admin assigns worker
- `GET /api/shifts/{id}/claimants` - Get shift claimants
- `POST /api/shifts/{id}/invite-workers` - Notify eligible workers

### Services
- `GET /api/services` - Get all services
- `GET /api/services/{id}` - Get specific service
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/{id}` - Update service (Admin)
- `DELETE /api/services/{id}` - Delete service (Admin)
- `POST /api/services/{id}/assign-clients` - Assign to clients

### Notifications
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/{id}` - Get specific notification
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

## Role-Based Access Control

- **Admin**: Full access to all endpoints including user and service management
- **Client**: Can manage own profile, sites, and shift requests
- **Worker**: Can manage own profile, view eligible shifts, claim shifts

## Worker Eligibility Rules

A worker is eligible for a shift if ALL three criteria are met:

1. **Distance**: Worker address to shift site ≤ 50 miles (driving distance)
2. **Service**: Shift service(s) match worker's offered services
3. **License**: Shift site state matches worker's licensed states

## Database Schema

### Core Tables
- **users** - Base user information for all roles
- **clients** - Client-specific data (company, services)
- **workers** - Worker-specific data (license, states, services)
- **admins** - Admin-specific data
- **sites** - Client locations with addresses
- **contact_persons** - Site contact information
- **services** - Available service types
- **shifts** - Shift details and assignments
- **shift_claims** - Worker claims on shifts
- **notifications** - User notifications

## Development

### Project Structure
```
backend/
├── app/
│   ├── models/          # SQLAlchemy models
│   ├── routers/         # API route handlers
│   ├── schemas/         # Pydantic schemas (to be added)
│   ├── utils/           # Utility functions (to be added)
│   ├── services/        # Business logic (to be added)
│   ├── config.py        # Configuration
│   └── database.py      # Database setup
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
└── .env.example         # Environment variables template
```

### Adding New Features

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create router in `app/routers/`
4. Add business logic in `app/services/`
5. Register router in `main.py`

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - JWT secret key (change in production!)
- `GOOGLE_MAPS_API_KEY` - Google Maps API key for distance calculations
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

## Production Deployment

1. Change `SECRET_KEY` to a secure random string
2. Use PostgreSQL database (not SQLite)
3. Set `DATABASE_URL` to production database
4. Set `DEBUG=False`
5. Use a production ASGI server like Gunicorn with Uvicorn workers:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Testing

(To be implemented)

```bash
pytest
```

## License

MIT