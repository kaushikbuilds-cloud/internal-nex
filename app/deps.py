"""FastAPI dependencies for authentication and role-based authorization."""
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth import AUTH_COOKIE_NAME, decode_access_token
from app.database import get_db
from app.models import User

# A single, generic error so failures never reveal *why* auth failed
# (missing cookie, bad signature, expired token, missing user all look the same).
_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Resolve the current user from the httpOnly auth cookie, or raise 401."""
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        raise _UNAUTHORIZED

    payload = decode_access_token(token)
    if payload is None:
        raise _UNAUTHORIZED

    user_id = payload.get("sub")
    if user_id is None:
        raise _UNAUTHORIZED

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise _UNAUTHORIZED

    return user


def require_role(role: str):
    """Return a dependency that requires the current user to have the given role."""

    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role == role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return user

    return role_checker
