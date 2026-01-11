from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User, Client, Worker, Admin, UserRole
from app.schemas import (
    ClientCreate, WorkerCreate, AdminCreate,
    LoginRequest, LoginResponse, UserResponse
)
from app.utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)

router = APIRouter()

@router.post("/register/client", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_client(client_data: ClientCreate, db: Session = Depends(get_db)):
    """Register a new client"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == client_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=client_data.email,
        hashed_password=get_password_hash(client_data.password),
        role=UserRole.CLIENT,
        name=client_data.name,
        address=client_data.address,
        phone=client_data.phone
    )
    db.add(user)
    db.flush()  # Get user.id without committing
    
    # Create client profile
    client = Client(
        user_id=user.id,
        company_name=client_data.company_name,
        requested_services=client_data.requested_services
    )
    db.add(client)
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/register/worker", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_worker(worker_data: WorkerCreate, db: Session = Depends(get_db)):
    """Register a new worker"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == worker_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=worker_data.email,
        hashed_password=get_password_hash(worker_data.password),
        role=UserRole.WORKER,
        name=worker_data.name,
        address=worker_data.address,
        phone=worker_data.phone
    )
    db.add(user)
    db.flush()
    
    # Create worker profile
    worker = Worker(
        user_id=user.id,
        license_type=worker_data.license_type,
        licensed_states=worker_data.licensed_states,
        services_offered=worker_data.services_offered
    )
    db.add(worker)
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/register/admin", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a new admin (requires existing admin)"""
    # Only admins can create other admins
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create other admins"
        )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == admin_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=admin_data.email,
        hashed_password=get_password_hash(admin_data.password),
        role=UserRole.ADMIN,
        name=admin_data.name,
        address=admin_data.address,
        phone=admin_data.phone
    )
    db.add(user)
    db.flush()
    
    # Create admin profile
    admin = Admin(user_id=user.id)
    db.add(admin)
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login and get access token"""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role.value
        }
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        name=user.name
    )

@router.post("/login/form", response_model=LoginResponse)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with OAuth2 form (for Swagger UI)"""
    # Find user by email (username field in form)
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role.value
        }
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        name=user.name
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout current user"""
    # In a stateless JWT system, logout is handled client-side by removing the token
    # This endpoint exists for consistency and can be extended with token blacklisting if needed
    return {"message": "Successfully logged out"}