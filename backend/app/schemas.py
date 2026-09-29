from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field

from .models import Role


# ---------- Auth ----------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------- Photos ----------

class ActivityPhotoOut(BaseModel):
    id: int
    file_path: str
    caption: Optional[str] = None
    position: int

    class Config:
        from_attributes = True


# ---------- Comments ----------

class CommentCreate(BaseModel):
    author_name: str = Field(min_length=2, max_length=120)
    author_email: Optional[EmailStr] = None
    content: str = Field(min_length=2, max_length=2000)


class CommentOut(BaseModel):
    id: int
    activity_id: int
    author_name: str
    content: str
    created_at: datetime
    is_approved: bool
    activity_title: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Activities ----------

class ActivityBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = ""
    location: Optional[str] = None
    activity_date: date
    is_published: bool = True


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    activity_date: Optional[date] = None
    is_published: Optional[bool] = None


class ActivityListOut(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    location: Optional[str]
    activity_date: date
    is_published: bool
    cover_photo: Optional[str] = None

    class Config:
        from_attributes = True


class ActivityDetailOut(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    location: Optional[str]
    activity_date: date
    is_published: bool
    created_at: datetime
    photos: List[ActivityPhotoOut] = []
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True


# ---------- Members / Mandates ----------

class MemberBase(BaseModel):
    last_name: str
    first_name: str
    option: Optional[str] = None
    role: Role


class MemberCreate(MemberBase):
    mandate_id: int


class MemberOut(MemberBase):
    id: int
    mandate_id: int
    photo_path: Optional[str] = None

    class Config:
        from_attributes = True


class MandateBase(BaseModel):
    label: str
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False


class MandateCreate(MandateBase):
    pass


class MandateOut(MandateBase):
    id: int
    members: List[MemberOut] = []

    class Config:
        from_attributes = True
