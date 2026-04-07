from pydantic import BaseModel, EmailStr, Field

class PropertyView(BaseModel):
    id: int
    owner_id: int
    name: str
    address: str
    price: int

    class Config:
        from_attributes = True


class AddProperty(BaseModel):
    name : str = Field(min_length=3, max_length=100) 
    address : str = Field(min_length=10, max_length=255) 
    price : int 

class UpdateProperty(BaseModel):
    
    name : str | None = Field(default=None,min_length=3, max_length=100)
    address : str| None = Field(default=None,min_length=10, max_length=255)
    price : int | None=None


class PropertyListView(BaseModel):
    owner_name: str
    property_count: int
    property: list[PropertyView]

class UnassignedPropertyList(BaseModel):
    owner_name: str
    count: int
    properties: list[PropertyView]

class UnassignedTenantBasic(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UnassignedTenantList(BaseModel):
    owner_name: str
    count: int
    tenants: list[UnassignedTenantBasic]