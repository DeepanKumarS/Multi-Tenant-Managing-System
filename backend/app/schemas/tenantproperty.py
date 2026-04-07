from pydantic import BaseModel
from datetime import datetime

class TenantPropertyView(BaseModel):
    id: int
    property_id: int
    tenant_id: int
    start_date: datetime
    end_date: datetime
    status: str

    class Config:
        from_attributes = True

class AssignProperty(BaseModel):
    start_date: datetime
    end_date: datetime

class EditTenantProperty(BaseModel):
    property_id: int | None=None
    tenant_id: int | None=None
    start_date: datetime | None=None
    end_date: datetime | None=None
    status: str | None=None

class TenantPropertySummary(BaseModel):
    pt_id: int
    property_name: str
    address: str
    price: int

class TenantWithProperties(BaseModel):
    tenant_id: int
    tenant_name: str
    assigned_properties: list[TenantPropertySummary]
    total_price: int

class TenantWithPropertiesList(BaseModel):
    owner_name: str
    tenants: list[TenantWithProperties]