# ShiftBridge Quick Start Guide

Get your ShiftBridge backend up and running in minutes!

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed (for frontend)
- Git installed

## Quick Start (SQLite - Easiest)

Perfect for development and testing. Follow these steps:

### 1. Navigate to Backend Directory
```bash
cd ShiftBridge/backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Fix SQLite Compatibility
```bash
python fix_sqlite_compatibility.py
```

This will automatically convert the database models to work with SQLite.

### 5. Start the Backend
```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 6. Seed the Database (New Terminal)
```bash
# Keep the backend running, open a new terminal
cd ShiftBridge/backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

python seed_data.py
```

### 7. Test the API
Open your browser and visit:
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Test Accounts

After seeding, you can login with these accounts:

### Admin Account
- **Email**: admin@shiftbridge.com
- **Password**: admin123
- **Access**: Full system access

### Client Accounts
- **Email**: client1@healthclinic.com
- **Password**: client123
- **Company**: Boston Health Clinic

- **Email**: client2@medcenter.com
- **Password**: client123
- **Company**: NYC Medical Center

### Worker Accounts
- **Email**: worker1@example.com
- **Password**: worker123
- **Type**: Medical Provider

- **Email**: worker2@example.com
- **Password**: worker123
- **Type**: Nurse

- **Email**: worker3@example.com
- **Password**: worker123
- **Type**: Medical Assistant

## Testing the API

### 1. Login
Go to http://localhost:8000/docs

1. Find the `POST /api/auth/login` endpoint
2. Click "Try it out"
3. Enter:
```json
{
  "email": "admin@shiftbridge.com",
  "password": "admin123"
}
```
4. Click "Execute"
5. Copy the `access_token` from the response

### 2. Authorize
1. Click the "Authorize" button at the top
2. Paste the token
3. Click "Authorize"

Now you can test all endpoints!

### 3. Try Some Endpoints
- `GET /api/services` - View all services
- `GET /api/clients` - View all clients (admin only)
- `GET /api/workers` - View all workers (admin only)
- `GET /api/shifts` - View shifts

## Production Setup (PostgreSQL)

For production deployment, use PostgreSQL:

### 1. Install PostgreSQL
Download from: https://www.postgresql.org/download/

### 2. Create Database
```sql
CREATE DATABASE shiftbridge;
CREATE USER shiftbridge_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE shiftbridge TO shiftbridge_user;
```

### 3. Update .env
```env
DATABASE_URL=postgresql://shiftbridge_user:your_password@localhost:5432/shiftbridge
```

### 4. Install PostgreSQL Driver
```bash
pip install psycopg2-binary
```

### 5. Run Application
```bash
python main.py
python seed_data.py
```

## Frontend Setup

### 1. Navigate to Frontend
```bash
cd ShiftBridge/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Project Structure

```
ShiftBridge/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routers/         # API endpoints
│   │   ├── schemas/         # Request/response schemas
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities (auth, etc.)
│   ├── main.py              # FastAPI app
│   ├── seed_data.py         # Sample data
│   └── fix_sqlite_compatibility.py  # SQLite fix script
└── frontend/
    ├── app/                 # Next.js pages
    └── components/          # React components
```

## Common Issues

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Port already in use"
Kill the process using port 8000 or change the port in `.env`

### "Database error"
1. Delete `shiftbridge.db`
2. Restart `python main.py`
3. Run `python seed_data.py` again

### "ARRAY type error"
Run the fix script:
```bash
python fix_sqlite_compatibility.py
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register/client` - Register client
- `POST /api/auth/register/worker` - Register worker
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service (admin)

### Clients
- `GET /api/clients` - List clients (admin)
- `GET /api/clients/{id}` - Get client
- `GET /api/clients/{id}/sites` - Get client sites

### Workers
- `GET /api/workers` - List workers (admin)
- `GET /api/workers/{id}` - Get worker
- `GET /api/workers/{id}/shifts` - Get worker shifts

### Shifts
- `GET /api/shifts` - List shifts
- `POST /api/shifts` - Create shift
- `POST /api/shifts/{id}/claim` - Claim shift (worker)
- `POST /api/shifts/{id}/assign` - Assign worker (admin)

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark as read

## Next Steps

1. ✅ Backend is running
2. ✅ Database is seeded
3. ✅ API is accessible
4. 🔄 Test endpoints in Swagger UI
5. 🔄 Connect frontend to backend
6. 🔄 Add Google Maps API key for distance calculations
7. 🔄 Deploy to production

## Need Help?

- **API Documentation**: http://localhost:8000/docs
- **Database Guide**: See `DATABASE_SETUP_GUIDE.md`
- **PRD**: See `PRD.md` for full requirements

## Development Tips

- Use the Swagger UI at `/docs` for testing
- Check logs in the terminal for errors
- Database file is `shiftbridge.db` (SQLite)
- All passwords are hashed with bcrypt
- JWT tokens expire after 30 minutes

Happy coding! 🚀