"""
ClawtBot — Content API Routes
CRUD operations for generated content.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from auth.models import User
from db.database import get_db
from db.models import Content, ContentStatus

router = APIRouter(prefix="/content", tags=["Content"])


# ─── Response Schemas ────────────────────────────────────────────────────────

class ContentResponse(BaseModel):
    id: UUID
    topic: str
    platform: str
    tone: str
    caption: Optional[str] = None
    hook: Optional[str] = None
    cta: Optional[str] = None
    post_text: Optional[str] = None
    niche_hashtags: Optional[list] = None
    broad_hashtags: Optional[list] = None
    review_score: Optional[float] = None
    review_feedback: Optional[str] = None
    improved_text: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ContentListResponse(BaseModel):
    total: int
    items: List[ContentResponse]


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("", response_model=ContentListResponse)
async def list_content(
    status_filter: Optional[str] = Query(None, alias="status"),
    platform: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all generated content with optional filters."""
    query = select(Content).order_by(desc(Content.created_at))

    if status_filter:
        query = query.where(Content.status == ContentStatus(status_filter))
    if platform:
        query = query.where(Content.platform == platform)

    # Count total
    from sqlalchemy import func
    count_query = select(func.count()).select_from(Content)
    if status_filter:
        count_query = count_query.where(Content.status == ContentStatus(status_filter))
    if platform:
        count_query = count_query.where(Content.platform == platform)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Fetch page
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()

    return ContentListResponse(
        total=total,
        items=[ContentResponse.model_validate(item) for item in items],
    )


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a single content item by ID."""
    result = await db.execute(select(Content).where(Content.id == content_id))
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return ContentResponse.model_validate(content)


@router.patch("/{content_id}/approve", response_model=ContentResponse)
async def approve_content(
    content_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Approve content for publishing."""
    result = await db.execute(select(Content).where(Content.id == content_id))
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    content.status = ContentStatus.APPROVED
    content.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(content)

    return ContentResponse.model_validate(content)


@router.patch("/{content_id}/reject")
async def reject_content(
    content_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Reject content (set back to draft)."""
    result = await db.execute(select(Content).where(Content.id == content_id))
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    content.status = ContentStatus.DRAFT
    content.updated_at = datetime.utcnow()

    return {"status": "success", "message": "Content rejected and set to draft"}


@router.delete("/{content_id}")
async def delete_content(
    content_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a content item."""
    result = await db.execute(select(Content).where(Content.id == content_id))
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    await db.delete(content)
    return {"status": "success", "message": "Content deleted"}
