from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api", tags=["comments"])


@router.post("/activities/{activity_id}/comments", response_model=schemas.CommentOut)
def post_comment(
    activity_id: int, payload: schemas.CommentCreate, db: Session = Depends(get_db)
):
    activity = db.query(models.Activity).get(activity_id)
    if not activity:
        raise HTTPException(404, "Activite introuvable")
    comment = models.Comment(activity_id=activity_id, **payload.model_dump())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/comments", response_model=List[schemas.CommentOut])
def list_all_comments(
    db: Session = Depends(get_db), current=Depends(auth.get_current_admin)
):
    """Vue admin : tous les commentaires, toutes activites confondues (publies directement sur le site)."""
    comments = db.query(models.Comment).order_by(models.Comment.created_at.desc()).all()
    results = []
    for c in comments:
        item = schemas.CommentOut.model_validate(c)
        item.activity_title = c.activity.title if c.activity else None
        results.append(item)
    return results


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current=Depends(auth.get_current_admin),
):
    comment = db.query(models.Comment).get(comment_id)
    if not comment:
        raise HTTPException(404, "Commentaire introuvable")
    db.delete(comment)
    db.commit()
    return {"detail": "Commentaire supprime"}
