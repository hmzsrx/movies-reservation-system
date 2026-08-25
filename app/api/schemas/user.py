from pydantic import EmailStr, ConfigDict, BaseModel
from uuid import UUID
from datetime import datetime

class create_user(BaseModel):
    
    name : str
    email : EmailStr
    password : str


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: EmailStr
    role: str
    created_at: datetime

class RoleUpdate(BaseModel):
    role: str
