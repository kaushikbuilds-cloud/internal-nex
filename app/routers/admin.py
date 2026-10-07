"""Admin-only example endpoint."""
from fastapi import APIRouter, Depends

from app.deps import require_role
from app.models import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/ping")
def admin_ping(current_user: User = Depends(require_role("admin"))):
    return {"message": "Admin authorization successful"}
