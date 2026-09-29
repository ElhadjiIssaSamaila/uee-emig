from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api", tags=["members"])


# ---------- Mandats (gestions) ----------

@router.get("/mandates", response_model=List[schemas.MandateOut])
def list_mandates(db: Session = Depends(get_db)):
    return (
        db.query(models.Mandate)
        .options(joinedload(models.Mandate.members))
        .order_by(models.Mandate.start_date.desc())
        .all()
    )


@router.get("/mandates/current", response_model=Optional[schemas.MandateOut])
def current_mandate(db: Session = Depends(get_db)):
    mandate = (
        db.query(models.Mandate)
        .filter(models.Mandate.is_current == True)
        .options(joinedload(models.Mandate.members))
        .first()
    )
    return mandate


@router.post("/mandates", response_model=schemas.MandateOut)
def create_mandate(
    payload: schemas.MandateCreate,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    if payload.is_current:
        db.query(models.Mandate).update({models.Mandate.is_current: False})
    mandate = models.Mandate(**payload.model_dump())
    db.add(mandate)
    db.commit()
    db.refresh(mandate)
    return mandate


@router.delete("/mandates/{mandate_id}")
def delete_mandate(
    mandate_id: int,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    mandate = db.query(models.Mandate).get(mandate_id)
    if not mandate:
        raise HTTPException(404, "Gestion introuvable")
    db.delete(mandate)
    db.commit()
    return {"detail": "Gestion supprimee"}


# ---------- Membres ----------

@router.post("/members", response_model=schemas.MemberOut)
def create_member(
    payload: schemas.MemberCreate,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    mandate = db.query(models.Mandate).get(payload.mandate_id)
    if not mandate:
        raise HTTPException(404, "Gestion introuvable")
    member = models.Member(**payload.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/members/{member_id}", response_model=schemas.MemberOut)
def update_member(
    member_id: int,
    payload: schemas.MemberBase,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    member = db.query(models.Member).get(member_id)
    if not member:
        raise HTTPException(404, "Membre introuvable")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(member, key, value)
    db.commit()
    db.refresh(member)
    return member


@router.put("/members/{member_id}/photo", response_model=schemas.MemberOut)
def update_member_photo(
    member_id: int,
    file_path: str,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    member = db.query(models.Member).get(member_id)
    if not member:
        raise HTTPException(404, "Membre introuvable")
    member.photo_path = file_path
    db.commit()
    db.refresh(member)
    return member


@router.delete("/members/{member_id}")
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    member = db.query(models.Member).get(member_id)
    if not member:
        raise HTTPException(404, "Membre introuvable")
    db.delete(member)
    db.commit()
    return {"detail": "Membre supprime"}
