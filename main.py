"""FastAPI application entry point.

Run with: uvicorn main:app --reload
"""
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded

from app.database import Base, engine
from app.limiter import limiter
from app.routers import admin, auth

# Create the 'users' table on startup if it doesn't already exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth Starter")

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Attach basic security headers to every response."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    # Simple CSP that allows same-origin scripts/styles only (no inline JS is used).
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self'; "
        "img-src 'self'; frame-ancestors 'none'"
    )
    return response


app.include_router(auth.router)
app.include_router(admin.router)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def serve_index():
    return FileResponse("static/index.html")


@app.get("/login.html")
def serve_login():
    return FileResponse("static/login.html")


@app.get("/register.html")
def serve_register():
    return FileResponse("static/register.html")


@app.get("/dashboard.html")
def serve_dashboard():
    return FileResponse("static/dashboard.html")
