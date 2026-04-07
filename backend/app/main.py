from fastapi import FastAPI, Depends
from app.dependencies.auth import get_current_user
from app.database.postgresql import Base, engine
from app.routes import auth, owner
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Public routes — no auth required
app.include_router(auth.router)

# Protected routes — auth enforced at router level
app.include_router(owner.router)


@app.get("/")
def root():
    return {"msg": "root page"}


@app.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user
