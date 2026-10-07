"""Command-line script to create an admin user.

Usage:
    python create_admin.py admin@example.com SecurePassword123
"""
import sys

from pydantic import EmailStr, TypeAdapter, ValidationError

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import User
from app.schemas import validate_password_strength

email_adapter = TypeAdapter(EmailStr)


def main():
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)

    raw_email, password = sys.argv[1], sys.argv[2]

    try:
        email = email_adapter.validate_python(raw_email).lower()
    except ValidationError:
        print("Error: invalid email address")
        sys.exit(1)

    try:
        validate_password_strength(password)
    except ValueError as exc:
        print(f"Error: {exc}")
        sys.exit(1)

    # Make sure the table exists even if the app has never been started.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing is not None:
            print(f"Error: a user with email '{email}' already exists")
            sys.exit(1)

        admin_user = User(email=email, hashed_password=hash_password(password), role="admin")
        db.add(admin_user)
        db.commit()
        print(f"Admin user '{email}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
