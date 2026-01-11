# ShiftBridge - Healthcare Staffing & Scheduling Platform

A comprehensive multi-state, multi-client, multi-worker scheduling and staffing management system for healthcare services.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- Python 3.8+ installed
- npm or yarn package manager
- pip for Python packages

### Installation & Running

#### Frontend Setup
```bash
cd ShiftBridge/frontend
npm install
npm run dev
```
Frontend will run on [http://localhost:3000](http://localhost:3000)

#### Backend Setup
```bash
cd ShiftBridge/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Backend API will run on [http://localhost:8000](http://localhost:8000)

## 📁 Project Structure

```
ShiftBridge/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js 15 app directory
│   ├── components/       # React components
│   ├── lib/             # Utilities and API clients
│   └── public/          # Static assets
├── backend/              # FastAPI backend application
│   ├── app/             # Application code
│   │   ├── models/      # Database models
│   │   ├── routers/     # API endpoints
│   │   ├── schemas/     # Pydantic schemas
│   │   └── utils/       # Utilities
│   ├── main.py          # FastAPI entry point
│   └── requirements.txt # Python dependencies
├── docs/                # Documentation
└── README.md           # This file
```

## 🎯 Key Features

### User Roles & Capabilities

#### 👥 Client
- Register and manage company profile
- Multiple sites with different addresses
- Multiple contact persons per site
- Request and manage shifts (24-hour scheduling)
- View confirmed shifts with worker details
- Cancel shifts
- Multi-service selection

#### 👨‍⚕️ Worker
- Register with license information (Medical Provider, Nurse, Medical Assistant)
- Multi-state licensing support
- Multi-service capability selection
- View and confirm assigned shifts
- Claim available shifts based on eligibility
- Receive notifications for new opportunities

#### 🔧 Admin
- Manage all client profiles and sites
- Manage all worker profiles
- Create and manage service types
- Create and assign shifts
- Handle shift confirmations and cancellations
- View comprehensive shift calendar

### Core Functionality

#### Intelligent Shift Matching
- **Distance-based**: Workers within 50 miles of shift location
- **Service-based**: Workers qualified for required services
- **License-based**: Workers licensed in the shift's state
- Automatic eligibility calculation

#### Notification System
- Real-time shift notifications
- Shift confirmation alerts
- Cancellation notifications
- "New" badges with 3-day auto-clear

#### Shift Management
- 24-hour scheduling support
- Repeatable shift patterns
- Multi-service shifts
- Worker claiming system
- Admin assignment workflow

## 📊 Tech Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React Context API
- **Forms:** React Hook Form + Zod validation

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL (SQLAlchemy ORM)
- **Authentication:** JWT tokens
- **Validation:** Pydantic
- **API Documentation:** Swagger/OpenAPI

## 🔐 User Roles

- **Client** - Manage sites, request shifts, view assigned workers
- **Worker** - View and claim shifts, manage availability
- **Admin** - Full system access, user management, shift coordination

## 📝 Current Status

**Project Status:** Initial Setup

This project is being set up with:
- Complete folder structure
- Backend API architecture (FastAPI)
- Frontend application (Next.js)
- Database schema design
- Authentication system
- Notification framework

### Next Steps:
1. Complete backend API endpoints
2. Implement frontend UI components
3. Set up database migrations
4. Implement notification system
5. Add distance calculation service
6. Deploy to production

## 📖 Documentation

- **PRD:** See [`PRD.md`](PRD.md) for complete product requirements
- **API Docs:** Available at `http://localhost:8000/docs` when backend is running
- **Backend Setup:** See [`backend/README.md`](backend/README.md)
- **Frontend Setup:** See [`frontend/README.md`](frontend/README.md)

## 🚧 Development Workflow

### Shift Creation Flow
1. Client requests shift OR Admin creates shift
2. Admin confirms shift request
3. System identifies eligible workers (distance + service + license)
4. Workers receive notification and can claim shift
5. Admin assigns worker from claimants
6. Worker confirms assignment
7. Shift appears in all relevant dashboards

### Cancellation Flow
1. Client or Admin initiates cancellation
2. Counterparty confirms cancellation
3. Assigned workers notified
4. Shift removed from all dashboards

## 🌐 Multi-State Support

The system supports:
- Workers licensed in multiple states
- Clients with sites across different states
- State-specific licensing validation
- Cross-state shift assignments

## 📞 Support

For questions or issues, refer to the PRD document or contact the development team.

---

**Built for healthcare staffing professionals**