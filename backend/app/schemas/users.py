from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    name : str = Field(min_length=3, max_length=100)
    email : EmailStr
    password : str = Field(min_length=4, max_length=255)


class UserView(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password : str = Field(min_length=4, max_length=100)


class TenantRegister(BaseModel):
    name : str = Field(min_length=3, max_length=100)
    owner_id: int 
    email : EmailStr
    password : str = Field(min_length=4, max_length=255)
    

class TenantView(BaseModel):
    id: int
    name: str
    owner_id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class TenantListView(BaseModel):
    owner_name: str
    total_tenants: int
    tenants: list[TenantView]


class TenantLogin(BaseModel):
    email: EmailStr
    password : str = Field(min_length=4, max_length=100)


# not needed but used for extra filter
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    owner_id: int | None
