from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.userdetail import User
from app.core.security import hash_password, verify, create_access_token
from app.schemas.users import UserRegister, UserView, UserLogin, TokenResponse, TenantRegister, TenantView
from app.database.postgresql import get_db

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=UserView)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_count = db.query(func.count(User.id)).scalar() or 0

    role = "admin" if user_count == 0 else "owner"
    user = User(name=payload.name, email=payload.email, password=hash_password(payload.password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email")
    if not verify(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token({"user_id": user.id, "role": user.role, "owner_id": user.owner_id})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "owner_id": user.owner_id, "role": user.role}


@router.post("/tenant-register", response_model=TenantView)
def tenant_register(payload: TenantRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    print("tenant register")
    print(payload)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    owner = db.query(User).filter(User.id == payload.owner_id).first()
    if not owner or owner.role != "owner":
        raise HTTPException(status_code=400, detail="Invalid owner id")

    user = User(name=payload.name, email=payload.email, password=hash_password(payload.password), role="tenant", owner_id=payload.owner_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
