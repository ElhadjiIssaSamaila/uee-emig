from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, engine, SessionLocal
from . import models, auth
from .routers import activities, comments, members, auth as auth_router, upload

Base.metadata.create_all(bind=engine)

Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)
Path(f"{settings.UPLOAD_DIR}/activities").mkdir(parents=True, exist_ok=True)
Path(f"{settings.UPLOAD_DIR}/members").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="API - Union des Eleves de l'EMIG (UEE)",
    description="API du site officiel de l'UEE : activites, membres du bureau, commentaires.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_router.router)
app.include_router(activities.router)
app.include_router(comments.router)
app.include_router(members.router)
app.include_router(upload.router)


@app.on_event("startup")
def create_default_admin():
    """Cree le compte administrateur par defaut s'il n'existe pas encore."""
    db = SessionLocal()
    try:
        existing = db.query(models.AdminUser).filter(
            models.AdminUser.email == settings.ADMIN_EMAIL
        ).first()
        if not existing:
            admin = models.AdminUser(
                email=settings.ADMIN_EMAIL,
                hashed_password=auth.hash_password(settings.ADMIN_PASSWORD),
                full_name="Administrateur UEE",
            )
            db.add(admin)
            db.commit()
            print(f"[UEE] Compte admin cree : {settings.ADMIN_EMAIL}")
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "message": "API UEE-EMIG en ligne"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
