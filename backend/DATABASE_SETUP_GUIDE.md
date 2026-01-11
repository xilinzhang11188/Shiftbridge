# Database Setup Guide for ShiftBridge

The ShiftBridge backend currently uses PostgreSQL `ARRAY` types which are not compatible with SQLite. You have two options to fix this:

## Option 1: Use PostgreSQL (Recommended for Production)

PostgreSQL is the recommended database for production as it supports all the features we need including ARRAY types, better performance, and scalability.

### Step 1: Install PostgreSQL

**Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (choose version 15 or later)
3. During installation:
   - Remember the password you set for the `postgres` user
   - Default port is 5432 (keep it)
   - Install pgAdmin 4 (GUI tool) when prompted

**Mac (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create the Database

**Option A - Using pgAdmin (Windows GUI):**
1. Open pgAdmin 4
2. Connect to PostgreSQL (use the password you set)
3. Right-click "Databases" → "Create" → "Database"
4. Name it: `shiftbridge`
5. Click "Save"

**Option B - Using Command Line:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE shiftbridge;

# Create a user (optional but recommended)
CREATE USER shiftbridge_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE shiftbridge TO shiftbridge_user;

# Exit
\q
```

### Step 3: Update Environment Variables

Edit `ShiftBridge/backend/.env`:

```env
# Change this line:
DATABASE_URL=sqlite:///./shiftbridge.db

# To this (if using postgres user):
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/shiftbridge

# Or this (if you created shiftbridge_user):
DATABASE_URL=postgresql://shiftbridge_user:your_secure_password@localhost:5432/shiftbridge
```

### Step 4: Install PostgreSQL Python Driver

```bash
cd ShiftBridge/backend
pip install psycopg2-binary
```

### Step 5: Run the Application

```bash
# The tables will be created automatically
python main.py

# In another terminal, seed the database
python seed_data.py
```

### Step 6: Verify It Works

Visit http://localhost:8000/docs and you should see the API documentation without errors.

---

## Option 2: Convert to SQLite-Compatible Types

If you want to stick with SQLite (good for development/testing), we need to convert ARRAY columns to JSON.

### Step 1: Update the Models

We need to change ARRAY types to JSON in these files:

#### File 1: `backend/app/models/user.py`

Find these lines in the `Client` class:
```python
requested_services = Column(ARRAY(Integer), default=[])
```

Change to:
```python
from sqlalchemy import JSON
requested_services = Column(JSON, default=list)
```

Find these lines in the `Worker` class:
```python
licensed_states = Column(ARRAY(String), nullable=False)
services_offered = Column(ARRAY(Integer), nullable=False)
```

Change to:
```python
licensed_states = Column(JSON, nullable=False)
services_offered = Column(JSON, nullable=False)
```

#### File 2: `backend/app/models/site.py`

Find this line:
```python
services_available = Column(ARRAY(Integer), default=[])
```

Change to:
```python
from sqlalchemy import JSON
services_available = Column(JSON, default=list)
```

#### File 3: `backend/app/models/shift.py`

Find this line:
```python
service_ids = Column(ARRAY(Integer), nullable=False)
```

Change to:
```python
from sqlalchemy import JSON
service_ids = Column(JSON, nullable=False)
```

### Step 2: Update Import Statements

In each of the files above, remove the `ARRAY` import:

Change:
```python
from sqlalchemy import Column, Integer, String, ..., ARRAY
```

To:
```python
from sqlalchemy import Column, Integer, String, ..., JSON
```

### Step 3: Ensure Default Values

Make sure all JSON columns have proper defaults. In your model definitions, use:
- `default=list` for empty arrays
- `default=dict` for empty objects

### Step 4: Run the Application

```bash
cd ShiftBridge/backend

# Delete old database if it exists
del shiftbridge.db  # Windows
# rm shiftbridge.db  # Mac/Linux

# Run the application (creates new database)
python main.py

# In another terminal, seed the database
python seed_data.py
```

### Step 5: Verify It Works

Visit http://localhost:8000/docs and test the endpoints.

---

## Quick Fix Script (Option 2)

I can create a script to automatically make these changes. Would you like me to do that?

---

## Comparison

| Feature | PostgreSQL | SQLite |
|---------|-----------|--------|
| **Setup** | More complex | Simple (no install) |
| **Performance** | Better for production | Good for development |
| **Array Support** | Native | Requires JSON workaround |
| **Concurrent Users** | Excellent | Limited |
| **Best For** | Production, team projects | Development, testing |

## Recommendation

- **For Development/Learning**: Use Option 2 (SQLite with JSON)
- **For Production/Deployment**: Use Option 1 (PostgreSQL)

---

## Troubleshooting

### PostgreSQL Connection Issues

**Error: "could not connect to server"**
- Make sure PostgreSQL service is running
- Windows: Check Services app
- Mac/Linux: `brew services list` or `systemctl status postgresql`

**Error: "password authentication failed"**
- Double-check your password in the DATABASE_URL
- Make sure you're using the correct username

### SQLite Issues

**Error: "no such table"**
- Delete the `.db` file and restart the application
- Tables are created automatically on first run

**Error: "JSON column issues"**
- Make sure you're passing lists/arrays as Python lists, not strings
- Example: `[1, 2, 3]` not `"[1, 2, 3]"`

---

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify your DATABASE_URL is correct
3. Make sure the database service is running (for PostgreSQL)
4. Try deleting the database and recreating it

Let me know which option you'd like to proceed with, and I can help you implement it!