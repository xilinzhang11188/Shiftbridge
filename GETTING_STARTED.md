# Getting Started with ShiftBridge - Simple Guide

Great! You've created your GitHub repository. Here's what to do next in plain English.

## Step 1: Connect Your Local Project to GitHub (5 minutes)

You have the code on your computer, and you have an empty repository on GitHub. Now we need to connect them.

1. **Open your terminal/command prompt**
2. **Navigate to the ShiftBridge folder:**
   ```bash
   cd ShiftBridge
   ```

3. **Connect to GitHub** (replace `YOUR_USERNAME` with your actual GitHub username):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ShiftBridge.git
   git branch -M main
   git push -u origin main
   ```

After this, refresh your GitHub repository page - you should see all your files there!

## Step 2: Set Up the Backend (10 minutes)

The backend is the "brain" of your app - it handles data, users, shifts, etc.

1. **Open a new terminal window**
2. **Go to the backend folder:**
   ```bash
   cd ShiftBridge/backend
   ```

3. **Create a Python virtual environment** (this keeps your project's packages separate):
   ```bash
   python -m venv venv
   ```

4. **Activate the virtual environment:**
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On Mac/Linux:
     ```bash
     source venv/bin/activate
     ```
   
   You'll see `(venv)` appear at the start of your command line.

5. **Install all the Python packages the backend needs:**
   ```bash
   pip install -r requirements.txt
   ```
   This will take a minute or two.

6. **Create your environment file** (this stores secret settings):
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux, use `cp .env.example .env`)

7. **Start the backend server:**
   ```bash
   python main.py
   ```

You should see a message like "Uvicorn running on http://127.0.0.1:8000"

**Keep this terminal window open!** The backend needs to stay running.

## Step 3: Set Up the Frontend (10 minutes)

The frontend is what users see and interact with - the website interface.

1. **Open ANOTHER new terminal window** (keep the backend running in the first one)
2. **Go to the frontend folder:**
   ```bash
   cd ShiftBridge/frontend
   ```

3. **Install all the Node.js packages the frontend needs:**
   ```bash
   npm install
   ```
   This will take 2-3 minutes.

4. **Create your environment file:**
   ```bash
   copy .env.example .env.local
   ```
   (On Mac/Linux, use `cp .env.example .env.local`)

5. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

You should see a message like "Local: http://localhost:3000"

**Keep this terminal window open too!**

## Step 4: See It Working!

1. **Open your web browser**
2. **Go to:** http://localhost:3000

You should see the ShiftBridge welcome page!

3. **Check the backend API documentation:**
   - Go to: http://localhost:8000/docs
   - This shows all the API endpoints (the backend's features)

## What You Have Now

- ✅ **Backend running** on http://localhost:8000 (the API/database layer)
- ✅ **Frontend running** on http://localhost:3000 (the user interface)
- ✅ **Code synced to GitHub** (your backup and collaboration hub)

## Daily Development Workflow

When you want to work on the project:

1. **Start the backend:**
   ```bash
   cd ShiftBridge/backend
   venv\Scripts\activate  # or source venv/bin/activate on Mac/Linux
   python main.py
   ```

2. **Start the frontend** (in a different terminal):
   ```bash
   cd ShiftBridge/frontend
   npm run dev
   ```

3. **Make your changes** in VS Code or your editor

4. **Save to GitHub** when you're done:
   ```bash
   cd ShiftBridge
   git add .
   git commit -m "Describe what you changed"
   git push
   ```

## Common Issues & Solutions

### "Command not found: python"
- Try `python3` instead of `python`
- Or install Python from python.org

### "Command not found: npm"
- Install Node.js from nodejs.org
- Restart your terminal after installing

### "Port 3000 is already in use"
- Something else is using that port
- Use a different port: `npm run dev -- -p 3001`
- Or stop the other program using port 3000

### "Permission denied"
- On Mac/Linux, you might need to use `sudo` before commands
- Or check file permissions

### Backend won't start
- Make sure you activated the virtual environment (you should see `(venv)`)
- Make sure you ran `pip install -r requirements.txt`

### Frontend won't start
- Make sure you ran `npm install` first
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

## What to Build Next

Now that everything is set up, you can start building features! Here's a suggested order:

1. **User Registration & Login** (backend + frontend)
   - Let clients, workers, and admins create accounts
   - Implement login functionality

2. **Client Dashboard**
   - Profile page
   - Site management
   - Shift request form

3. **Worker Dashboard**
   - Profile page
   - View available shifts
   - Claim shifts

4. **Admin Dashboard**
   - Manage users
   - Create shifts
   - Assign workers

5. **Notification System**
   - Real-time alerts
   - "New" badges

6. **Eligibility Matching**
   - Distance calculation
   - License validation
   - Service matching

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Look at [PRD.md](PRD.md) for feature specifications
- Check [GITHUB_SETUP.md](GITHUB_SETUP.md) for Git/GitHub help
- The backend API docs at http://localhost:8000/docs show all available endpoints

## Quick Reference Commands

```bash
# Start backend
cd ShiftBridge/backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
python main.py

# Start frontend (different terminal)
cd ShiftBridge/frontend
npm run dev

# Save changes to GitHub
cd ShiftBridge
git add .
git commit -m "Your message here"
git push

# Install new Python package
pip install package-name
pip freeze > requirements.txt  # Update requirements file

# Install new Node package
npm install package-name
```

---

**You're all set!** Start building your healthcare staffing platform! 🚀