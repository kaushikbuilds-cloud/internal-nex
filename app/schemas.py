"""Pydantic request/response models. Password hashes are never exposed."""
import re

from pydantic import BaseModel, EmailStr, field_validator


def validate_password_strength(password: str) -> str:
    """Shared server-side password policy: 9+ chars, at least one letter and one digit.

    The backend must enforce this even though the frontend also checks it,
    because client-side validation can always be bypassed.
    """
    if len(password) < 9:
        raise ValueError("Password must be at least 9 characters long")
    if not re.search(r"[A-Za-z]", password):
        raise ValueError("Password must contain at least one letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one number")
    return password


class UserRegister(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        return validate_password_strength(value)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    email: str
    role: str

    model_config = {"from_attributes": True}
