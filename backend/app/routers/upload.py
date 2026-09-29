import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from .. import auth
from ..config import settings

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIZE_MB = 8

CLOUDINARY_ACTIF = bool(
    settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET
)

if CLOUDINARY_ACTIF:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


@router.post("/{folder}")
async def upload_image(
    folder: str,
    file: UploadFile = File(...),
    current=Depends(auth.get_current_admin),
):
    if folder not in {"activities", "members"}:
        raise HTTPException(400, "Dossier de destination invalide")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Format d'image non supporte (jpg, png, webp)")

    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"Image trop volumineuse (max {MAX_SIZE_MB} Mo)")

    if CLOUDINARY_ACTIF:
        # Stockage permanent chez Cloudinary : la photo survit aux redeploiements.
        resultat = cloudinary.uploader.upload(
            contents,
            folder=f"uee-emig/{folder}",
            resource_type="image",
        )
        return {"file_path": resultat["secure_url"]}

    # Repli local (developpement uniquement) : perdu au prochain redeploiement
    # si l'hebergeur n'a pas de disque persistant.
    dest_dir = Path(settings.UPLOAD_DIR) / folder
    dest_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = dest_dir / filename
    with open(dest_path, "wb") as f:
        f.write(contents)

    relative_path = f"/uploads/{folder}/{filename}"
    return {"file_path": relative_path}
