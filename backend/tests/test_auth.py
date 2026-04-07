import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.postgresql import get_db, Base

# Use a separate in-memory SQLite DB for tests (does not touch your real DB)
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the real DB with the test DB
app.dependency_overrides[get_db] = override_get_db

# Create tables before tests run
Base.metadata.create_all(bind=engine)

client = TestClient(app)


# ── Auth Tests ───────────────────────────────────────────────

def test_register_owner_success():
    res = client.post("/register", json={"name": "Owner One", "email": "owner@test.com", "password": "pass123"})
    assert res.status_code == 200
    assert res.json()["email"] == "owner@test.com"


def test_register_duplicate_email():
    # First registration (already done above, but re-attempt with same email)
    client.post("/register", json={"name": "Owner One", "email": "dup@test.com", "password": "pass123"})
    res = client.post("/register", json={"name": "Owner One", "email": "dup@test.com", "password": "pass123"})
    assert res.status_code == 400
    assert res.json()["detail"] == "Email already exists"


def test_login_success():
    client.post("/register", json={"name": "Login User", "email": "login@test.com", "password": "pass123"})
    res = client.post("/login", json={"email": "login@test.com", "password": "pass123"})
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password():
    client.post("/register", json={"name": "Wrong Pass", "email": "wrongpass@test.com", "password": "pass123"})
    res = client.post("/login", json={"email": "wrongpass@test.com", "password": "wrongpassword"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid password"


def test_login_wrong_email():
    res = client.post("/login", json={"email": "nobody@test.com", "password": "pass123"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid email"


def test_protected_route_without_token():
    res = client.get("/owner/1/tenants")
    assert res.status_code == 403
