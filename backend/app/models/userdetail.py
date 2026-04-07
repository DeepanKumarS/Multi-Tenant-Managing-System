from sqlalchemy import Column, Integer, String, Enum, DateTime,ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.postgresql import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    owner_id = Column(Integer,nullable=True)
    role = Column(String(30), nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer,primary_key=True)
    name = Column(String(100),nullable=False)
    address = Column(String(255),nullable=False)
    price = Column(Integer,nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
  
class PropertyTenant(Base):
    __tablename__ = "property_tenants"
    id = Column(Integer,primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"))
    tenant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(15), default="occupied")
    created_at = Column(DateTime(timezone=True), server_default=func.now(),nullable=False)