# GitHub Setup Guide for ShiftBridge

This guide will help you set up the ShiftBridge project on GitHub and get it ready for development.

## Prerequisites

- Git installed on your computer
- GitHub account created
- Terminal/Command Prompt access

## Step 1: Initialize Local Git Repository

Navigate to the ShiftBridge project directory and initialize Git:

```bash
cd ShiftBridge
git init
```

## Step 2: Create Initial Commit

Add all files and create your first commit:

```bash
git add .
git commit -m "Initial commit: ShiftBridge project setup with backend and frontend"
```

## Step 3: Create GitHub Repository

### Option A: Using GitHub Website

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `ShiftBridge` (or your preferred name)
   - **Description**: "Healthcare staffing and scheduling platform - Multi-state, multi-client, multi-worker management system"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Option B: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create ShiftBridge --public --description "Healthcare staffing and scheduling platform"
```

## Step 4: Connect Local Repository to GitHub

After creating the repository on GitHub, connect your local repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ShiftBridge.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 5: Verify Setup

Check that everything is connected:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/ShiftBridge.git (fetch)
origin  https://github.com/YOUR_USERNAME/ShiftBridge.git (push)
```

## Step 6: Set Up Branch Protection (Optional but Recommended)

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Branches" in the left sidebar
4. Click "Add rule" under "Branch protection rules"
5. Set branch name pattern: `main`
6. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (if working with a team)
   - ✅ Require status checks to pass before merging
7. Click "Create"

## Step 7: Add Collaborators (If Working with a Team)

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Collaborators" in the left sidebar
4. Click "Add people"
5. Enter GitHub usernames or emails
6. Select appropriate permission level

## Project Structure on GitHub

Your repository will have this structure:

```
ShiftBridge/
├── .gitignore                 # Git ignore rules
├── README.md                  # Project overview
├── PRD.md                     # Product requirements
├── GITHUB_SETUP.md           # This file
├── backend/                   # FastAPI backend
│   ├── app/                  # Application code
│   ├── main.py               # Entry point
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment template
│   └── README.md             # Backend documentation
└── frontend/                  # Next.js frontend
    ├── app/                  # Next.js app directory
    ├── components/           # React components
    ├── lib/                  # Utilities
    ├── package.json          # Node dependencies
    ├── .env.example          # Environment template
    └── README.md             # Frontend documentation
```

## Development Workflow

### Creating a New Feature

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "Add: description of your changes"
```

3. Push to GitHub:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub
5. Review and merge after approval

### Keeping Your Branch Updated

```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
```

## Commit Message Conventions

Use clear, descriptive commit messages:

- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for changes to existing features
- `Refactor:` for code refactoring
- `Docs:` for documentation changes
- `Style:` for formatting changes
- `Test:` for adding tests

Examples:
```bash
git commit -m "Add: worker eligibility matching algorithm"
git commit -m "Fix: shift claiming notification bug"
git commit -m "Update: client dashboard UI improvements"
```

## Environment Variables

**IMPORTANT**: Never commit `.env` files to GitHub!

The `.gitignore` file is already configured to exclude:
- `.env`
- `.env.local`
- `.env.*.local`

Always use `.env.example` files as templates.

## Setting Up CI/CD (Optional)

### GitHub Actions for Backend Testing

Create `.github/workflows/backend-tests.yml`:

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest
```

### GitHub Actions for Frontend Testing

Create `.github/workflows/frontend-tests.yml`:

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Run linter
        run: |
          cd frontend
          npm run lint
      - name: Build
        run: |
          cd frontend
          npm run build
```

## Deployment

### Backend Deployment Options

1. **Heroku**: Easy deployment for FastAPI
2. **Railway**: Modern platform with free tier
3. **AWS EC2**: Full control, more complex
4. **DigitalOcean**: Simple VPS hosting

### Frontend Deployment Options

1. **Vercel**: Recommended for Next.js (automatic deployments)
2. **Netlify**: Alternative with good Next.js support
3. **AWS Amplify**: AWS-integrated solution
4. **Cloudflare Pages**: Fast global CDN

## Troubleshooting

### Issue: "Permission denied (publickey)"

Solution: Set up SSH keys or use HTTPS with personal access token.

### Issue: "Failed to push some refs"

Solution: Pull latest changes first:
```bash
git pull origin main --rebase
git push origin main
```

### Issue: Large files rejected

Solution: Use Git LFS for large files or add to `.gitignore`.

## Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## Next Steps

1. ✅ Initialize Git repository
2. ✅ Create GitHub repository
3. ✅ Push initial commit
4. 📝 Set up development branch
5. 📝 Configure CI/CD (optional)
6. 📝 Add team collaborators
7. 📝 Start development!

---

**Need Help?** Check the main [README.md](README.md) or create an issue on GitHub.