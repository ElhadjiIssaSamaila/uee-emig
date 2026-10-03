import re
import unicodedata
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/activities", tags=["activities"])


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)


def unique_slug(db: Session, base_slug: str) -> str:
    slug = base_slug
    counter = 2
    while db.query(models.Activity).filter(models.Activity.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


@router.get("", response_model=List[schemas.ActivityListOut])
def list_activities(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Recherche par titre"),
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(models.Activity).filter(models.Activity.is_published == True)
    if q:
        query = query.filter(models.Activity.title.ilike(f"%{q}%"))
    activities = (
        query.order_by(models.Activity.activity_date.desc())
        .offset(offset).limit(limit).all()
    )
    results = []
    for a in activities:
        cover = a.photos[0].file_path if a.photos else None
        item = schemas.ActivityListOut.model_validate(a)
        item.cover_photo = cover
        results.append(item)
    return results


@router.get("/gallery")
def full_gallery(db: Session = Depends(get_db)):
    """Retourne toutes les photos de toutes les activites publiees, pour la page Galerie."""
    activities = (
        db.query(models.Activity)
        .filter(models.Activity.is_published == True)
        .options(joinedload(models.Activity.photos))
        .order_by(models.Activity.activity_date.desc())
        .all()
    )
    photos = []
    for a in activities:
        for p in a.photos:
            photos.append({
                "id": p.id,
                "file_path": p.file_path,
                "caption": p.caption,
                "activity_id": a.id,
                "activity_title": a.title,
                "activity_slug": a.slug,
            })
    return photos


@router.get("/{slug}", response_model=schemas.ActivityDetailOut)
def get_activity(slug: str, db: Session = Depends(get_db)):
    activity = db.query(models.Activity).filter(models.Activity.slug == slug).first()
    if not activity:
        raise HTTPException(404, "Activite introuvable")
    # Les commentaires sont publies immediatement, sans validation prealable
    return activity


# ---------- Routes admin ----------

@router.post("", response_model=schemas.ActivityDetailOut)
def create_activity(
    payload: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    base_slug = slugify(payload.title)
    slug = unique_slug(db, base_slug)
    activity = models.Activity(**payload.model_dump(), slug=slug)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/{activity_id}", response_model=schemas.ActivityDetailOut)
def update_activity(
    activity_id: int,
    payload: schemas.ActivityUpdate,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    activity = db.query(models.Activity).get(activity_id)
    if not activity:
        raise HTTPException(404, "Activite introuvable")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(activity, key, value)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}")
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    activity = db.query(models.Activity).get(activity_id)
    if not activity:
        raise HTTPException(404, "Activite introuvable")
    db.delete(activity)
    db.commit()
    return {"detail": "Activite supprimee"}


@router.post("/{activity_id}/photos", response_model=schemas.ActivityPhotoOut)
def add_photo(
    activity_id: int,
    file_path: str,
    caption: Optional[str] = None,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    activity = db.query(models.Activity).get(activity_id)
    if not activity:
        raise HTTPException(404, "Activite introuvable")
    position = len(activity.photos)
    photo = models.ActivityPhoto(
        activity_id=activity_id, file_path=file_path, caption=caption, position=position
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}")
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    photo = db.query(models.ActivityPhoto).get(photo_id)
    if not photo:
        raise HTTPException(404, "Photo introuvable")
    db.delete(photo)
    db.commit()
    return {"detail": "Photo supprimee"}
