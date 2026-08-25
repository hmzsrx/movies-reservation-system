from uuid import UUID

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.api.core.dep import (
    get_db,
    get_current_user,
    require_role
)

from app.api.models.user import User
from app.api.services.user import UserService
from app.api.schemas.user import (
    create_user as UserCreate,
    UserUpdate,
    UserResponse,
    RoleUpdate
)


router = APIRouter()


def get_user_service(
    db: Session = Depends(get_db)
) -> UserService:
    return UserService(db)


# =========================================================
# GET MY PROFILE
# Login user apni profile dekh sakta hai
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


# =========================================================
# GET USER BY ID
# User apni profile dekh sakta hai
# Admin kisi bhi user ki profile dekh sakta hai
# =========================================================

@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )

    return service.get_user(user_id)


# =========================================================
# GET ALL USERS
# Sirf ADMIN
# =========================================================

@router.get(
    "/",
    response_model=list[UserResponse]
)
def get_users(
    current_user: User = Depends(
        require_role("admin")
    ),
    service: UserService = Depends(get_user_service),
):
    return service.get_users()


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse
)
def update_user_role(
    user_id: UUID,
    role_data: RoleUpdate,
    current_user: User = Depends(
        require_role("admin")
    ),
    service: UserService = Depends(get_user_service),
    ):
    if role_data.role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'user' or 'admin'"
        )

    return service.update_role(
        user_id,
        role_data.role
    )


# =========================================================
# UPDATE USER
# User sirf apni profile update kar sakta hai
# =========================================================

@router.put(
    "/{user_id}",
    response_model=UserResponse
)
def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):

    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )

    return service.update_user(
        user_id,
        user_data
    )


# =========================================================
# DELETE USER
# Sirf ADMIN
# =========================================================

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_user(
    user_id: UUID,
    current_user: User = Depends(
        require_role("admin")
    ),
    service: UserService = Depends(get_user_service),
):
    service.delete_user(user_id)