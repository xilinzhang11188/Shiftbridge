# How to Edit the .env File - Visual Guide

## Current File Location
📁 `ShiftBridge/backend/.env`

## What You See Now (Line 2)

```env
DATABASE_URL=sqlite:///./shiftbridge.db
```

## What You Need to Do

### Option A: Keep Using SQLite (EASIEST - RECOMMENDED FOR YOU!)

**Do this if you want the simplest setup:**

✅ **NO CHANGES NEEDED!** Just run the fix script:

```bash
cd ShiftBridge/backend
python fix_sqlite_compatibility.py
```

That's it! The `.env` file stays exactly as it is.

---

### Option B: Switch to PostgreSQL (For Production)

**Only do this if you:**
- Installed PostgreSQL
- Created a database called `shiftbridge`
- Know your PostgreSQL password

**Step-by-Step:**

1. **Open the file** `ShiftBridge/backend/.env` in VS Code

2. **Find line 2** which currently says:
   ```env
   DATABASE_URL=sqlite:///./shiftbridge.db
   ```

3. **Delete that line completely**

4. **Type this new line instead** (replace the parts in CAPS):
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/shiftbridge
   ```

5. **Replace `YOUR_PASSWORD_HERE`** with your actual PostgreSQL password
   - Example: If your password is `admin123`, it becomes:
   ```env
   DATABASE_URL=postgresql://postgres:admin123@localhost:5432/shiftbridge
   ```

6. **Save the file** (Ctrl+S or Cmd+S)

## Visual Example

### BEFORE (Current - SQLite):
```env
# Database Configuration
DATABASE_URL=sqlite:///./shiftbridge.db

# Security
SECRET_KEY=your-secret-key-here-change-in-production-09876543210
```

### AFTER (PostgreSQL):
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:MyActualPassword@localhost:5432/shiftbridge

# Security
SECRET_KEY=your-secret-key-here-change-in-production-09876543210
```

## Understanding the PostgreSQL Connection String

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
     ↓          ↓         ↓       ↓      ↓      ↓
  Database   User    Password  Where  Port  Database
   Type      Name              Running       Name
```

### Breaking It Down:

| Part | What It Means | Your Value |
|------|---------------|------------|
| `postgresql://` | Database type | Don't change |
| `postgres` | Username | Use `postgres` (default) |
| `MyActualPassword` | Password | **YOUR password** |
| `localhost` | Server location | Don't change (your computer) |
| `5432` | Port number | Don't change (default) |
| `shiftbridge` | Database name | Don't change |

## Common Mistakes to Avoid

❌ **Wrong:** Leaving spaces
```env
DATABASE_URL = postgresql://postgres:password@localhost:5432/shiftbridge
```

✅ **Correct:** No spaces around `=`
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/shiftbridge
```

❌ **Wrong:** Forgetting to replace YOUR_PASSWORD_HERE
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/shiftbridge
```

✅ **Correct:** Using your actual password
```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/shiftbridge
```

❌ **Wrong:** Adding quotes
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/shiftbridge"
```

✅ **Correct:** No quotes
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/shiftbridge
```

## How to Edit in VS Code

### Method 1: Using the Sidebar
1. Click on the Explorer icon (📁) in the left sidebar
2. Navigate to: `ShiftBridge` → `backend` → `.env`
3. Click on `.env` to open it
4. Find line 2
5. Change it as shown above
6. Press `Ctrl+S` (Windows) or `Cmd+S` (Mac) to save

### Method 2: Using Quick Open
1. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
2. Type: `.env`
3. Press Enter
4. Edit line 2
5. Save with `Ctrl+S` or `Cmd+S`

## My Recommendation for You

🎯 **Use SQLite (Option A)** because:
- ✅ No installation needed
- ✅ No password to remember
- ✅ Works immediately
- ✅ Perfect for learning and development
- ✅ One command to fix: `python fix_sqlite_compatibility.py`

You can always switch to PostgreSQL later when you're ready to deploy!

## What to Do After Editing

### If you kept SQLite:
```bash
python fix_sqlite_compatibility.py
python main.py
python seed_data.py
```

### If you switched to PostgreSQL:
```bash
pip install psycopg2-binary
python main.py
python seed_data.py
```

## Need Help?

If you're stuck:
1. Check that you saved the file (look for the dot • next to the filename)
2. Make sure there are no spaces around the `=` sign
3. Verify your PostgreSQL password is correct
4. Try the SQLite option instead - it's much easier!

## Quick Test

After editing, test if it works:
```bash
python main.py
```

If you see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Success!** Your database is configured correctly.

If you see an error about "could not connect":
❌ Check your password or switch to SQLite option.