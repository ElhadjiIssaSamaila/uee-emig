from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://uee_user:uee_password@localhost:5432/uee_emig"

    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 180

    ADMIN_EMAIL: str = "admin@uee-emig.ne"
    ADMIN_PASSWORD: str = "changeme123"

    FRONTEND_ORIGIN: str = "http://localhost:5173"

    UPLOAD_DIR: str = "uploads"

    # Cloudinary (stockage permanent des photos). Si vide, les photos sont
    # enregistrees sur le disque local (pratique en developpement, mais
    # PERDU a chaque redeploiement sur un hebergeur comme Render en plan gratuit).
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # encoding="utf-8-sig" tolere un fichier .env enregistre avec un BOM
    # (ce qui arrive souvent quand il est cree/edite avec le Bloc-notes Windows)
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8-sig")


settings = Settings()
