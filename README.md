# Auth Starter

A simple, beginner-friendly, production-conscious full-stack authentication
starter. It demonstrates registration, login, logout, protected pages, and
role-based authorization using only a small, well-understood stack.

## Overview

This project is a small website with:

- A responsive landing page
- User registration and login
- A protected dashboard that only signed-in users can view
- An admin-only example endpoint
- JWT-based sessions stored in a secure, httpOnly cookie (never localStorage)
- Passwords hashed with bcrypt
- A single SQLite table for all persistence

## Features

- Registration with server-side email and password validation
- Login / Logout
- JWT authentication via an httpOnly cookie
- Protected dashboard page
- Admin authorization example (`/api/admin/ping`)
- Rate limiting on login and registration
- SQLite database via SQLAlchemy ORM
- Responsive, accessible frontend (HTML/CSS/vanilla JavaScript, no frameworks)
- FastAPI automatic API documentation at `/docs`

## Project Structure

```
/
├── main.py
├── create_admin.py
├── requirements.txt
├── .env.example
├── README.md
│
├── app/
│   ├── __init__.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── deps.py
│   ├── limiter.py
│   │
│   └── routers/
│       ├── __init__.py
│       ├── auth.py
│       └── admin.py
│
└── static/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    │
    ├── css/
    │   └── styles.css
    │
    └── js/
        ├── common.js
        ├── index.js
        ├── login.js
        ├── register.js
        └── dashboard.js
```

> Note: `app/limiter.py` holds the shared `slowapi` `Limiter` instance so it
> can be imported by both `main.py` and `app/routers/auth.py` without a
> circular import. It is a small addition to the requested structure.

## Requirements

- Python 3.11+

## Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   ```

   **Windows:**
   ```bash
   .venv\Scripts\activate
   ```

   **macOS/Linux:**
   ```bash
   source .venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy the example environment file and set a strong secret key:

   ```bash
   cp .env.example .env
   ```

   Generate a strong secret key with:

   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

   Paste the result into `.env` as the value of `SECRET_KEY`. **Never commit
   your `.env` file.**

## Run

```bash
uvicorn main:app --reload
```

Open the app at: http://127.0.0.1:8000

Interactive API docs (Swagger UI) are available at: http://127.0.0.1:8000/docs

## Create an Admin User

```bash
python create_admin.py admin@example.com SecurePassword123
```

This creates a user with `role="admin"`. It will fail safely (without
creating a duplicate) if the email already exists.

## Example curl Commands

These examples use `curl`. On Windows, run them from Git Bash, WSL, or
PowerShell with the backslash line continuations adjusted (replace `\` with
a backtick `` ` `` in PowerShell).

**Register:**

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

**Login (save the session cookie to a file):**

```bash
curl -c cookies.txt -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

**Get current user (send the saved cookie):**

```bash
curl -b cookies.txt http://127.0.0.1:8000/api/auth/me
```

**Admin ping (requires logging in as an admin first):**

```bash
curl -b cookies.txt http://127.0.0.1:8000/api/admin/ping
```

**Logout:**

```bash
curl -b cookies.txt -X POST http://127.0.0.1:8000/api/auth/logout
```

## Production Security Notes

The default configuration is intended for **local development only**.
Before deploying this application, review the following:

- **HTTPS**: Production deployments must be served over HTTPS. Browsers and
  this app's cookie settings assume a secure transport layer in production.
- **Secure cookies**: The authentication cookie is set with `secure=False`
  by default for local HTTP development. Set the `COOKIE_SECURE=true`
  environment variable (or edit `app/routers/auth.py`) so the cookie is sent
  with `secure=True` once the app is served over HTTPS. Without this, the
  cookie could be transmitted over an insecure connection.
- **SECRET_KEY**: Use a long, cryptographically random secret key in
  production, generated independently of any value in this repository.
  Never commit your `.env` file to version control.
- **Database**: SQLite is appropriate for this small starter project, but a
  larger or multi-instance production deployment may need a more scalable
  database engine.
- **Rate limiting**: The built-in `slowapi` rate limiting is in-memory and
  per-process. A production deployment running multiple instances behind a
  load balancer may need a distributed rate-limiting solution.
- **CSRF**: Because authentication relies on cookies, consider adding CSRF
  protection (such as a double-submit cookie or CSRF token) as the
  application grows beyond this starter, especially if you add
  state-changing endpoints accessible from third-party origins. This
  starter does not implement CSRF protection beyond `SameSite=Strict`
  cookies, which already mitigates most cross-site request scenarios for
  typical browsers.
