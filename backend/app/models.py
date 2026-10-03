import enum
from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Date, ForeignKey, Enum, Boolean
)
from sqlalchemy.orm import relationship

from .database import Base


class Role(str, enum.Enum):
    SG = "SG"          # Secretaire General
    SGA = "SG/A"        # Secretaire General Adjoint
    SCP = "SCP"          # Secretaire Charge de la Presse
    SCAA = "SCAA"        # Secretaire Charge des Affaires Academiques
    SCAS = "SCAS"        # Secretaire Charge des Affaires Sociales
    SCACS = "SCACS"      # Secretaire Charge des Activites Culturelles et Sportives
    SCTG = "SCTG"        # Secretaire Charge de la Tresorerie Generale


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Administrateur UEE")
    created_at = Column(DateTime, default=datetime.utcnow)


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(280), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False, default="")
    location = Column(String(255), nullable=True)
    activity_date = Column(Date, nullable=False, default=date.today)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    photos = relationship(
        "ActivityPhoto", back_populates="activity",
        cascade="all, delete-orphan", order_by="ActivityPhoto.position"
    )
    comments = relationship(
        "Comment", back_populates="activity",
        cascade="all, delete-orphan", order_by="Comment.created_at.desc()"
    )


class ActivityPhoto(Base):
    __tablename__ = "activity_photos"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    file_path = Column(String(500), nullable=False)  # chemin relatif servi par /uploads
    caption = Column(String(255), nullable=True)
    position = Column(Integer, default=0)

    activity = relationship("Activity", back_populates="photos")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    author_name = Column(String(120), nullable=False)
    author_email = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    activity = relationship("Activity", back_populates="comments")


class Mandate(Base):
    """Une gestion / mandat du bureau de l'UEE (dure en general un an)."""
    __tablename__ = "mandates"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(120), nullable=False)  # ex: "Gestion 2025 - 2026"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)

    members = relationship(
        "Member", back_populates="mandate", cascade="all, delete-orphan"
    )


class Member(Base):
    """Un membre du bureau pour une gestion donnee."""
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    mandate_id = Column(Integer, ForeignKey("mandates.id"), nullable=False)
    last_name = Column(String(120), nullable=False)
    first_name = Column(String(120), nullable=False)
    option = Column(String(150), nullable=True)  # filiere / option d'etude
    role = Column(Enum(Role), nullable=False)
    photo_path = Column(String(500), nullable=True)

    mandate = relationship("Mandate", back_populates="members")
