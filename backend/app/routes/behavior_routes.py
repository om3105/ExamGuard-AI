from fastapi import APIRouter, Depends
from app.models.all_models import BehaviorLog, User
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

router = APIRouter()


class BehaviorLogPayload(BaseModel):
    exam_id: str
    submission_id: Optional[str] = None
    keystroke_count: int = 0
    avg_typing_speed: float = 0.0
    backspace_ratio: float = 0.0
    paste_count: int = 0
    pasted_chars: int = 0
    tab_switch_count: int = 0
    mouse_click_count: int = 0
    time_per_question: dict = {}


@router.post("/log", status_code=200)
async def log_behavior(
    payload: BehaviorLogPayload,
    current_user: User = Depends(get_current_user)
):
    """
    Receive batched behavioral events from the exam interface.
    Upserts (merges) into an existing BehaviorLog for the session,
    or creates a new one if it doesn't exist.
    """
    user_id = str(current_user.id)

    # Try to find existing log for this session
    existing = None
    if payload.submission_id:
        existing = await BehaviorLog.find_one(
            BehaviorLog.submission_id == payload.submission_id
        )

    if existing:
        # Merge: accumulate counters, keep maximums for rates
        existing.keystroke_count += payload.keystroke_count
        existing.paste_count += payload.paste_count
        existing.pasted_chars += payload.pasted_chars
        existing.tab_switch_count = max(existing.tab_switch_count, payload.tab_switch_count)
        existing.mouse_click_count += payload.mouse_click_count
        # Average the typing speed
        if payload.avg_typing_speed > 0:
            existing.avg_typing_speed = round(
                (existing.avg_typing_speed + payload.avg_typing_speed) / 2, 3
            )
        existing.backspace_ratio = round(
            (existing.backspace_ratio + payload.backspace_ratio) / 2, 3
        )
        # Merge time_per_question
        for key, val in payload.time_per_question.items():
            existing.time_per_question[key] = existing.time_per_question.get(key, 0) + val
        existing.recorded_at = datetime.now(timezone.utc)
        await existing.save()
        return {"status": "updated", "id": str(existing.id)}
    else:
        log = BehaviorLog(
            submission_id=payload.submission_id or "",
            user_id=user_id,
            exam_id=payload.exam_id,
            keystroke_count=payload.keystroke_count,
            avg_typing_speed=payload.avg_typing_speed,
            backspace_ratio=payload.backspace_ratio,
            paste_count=payload.paste_count,
            pasted_chars=payload.pasted_chars,
            tab_switch_count=payload.tab_switch_count,
            mouse_click_count=payload.mouse_click_count,
            time_per_question=payload.time_per_question,
        )
        await log.insert()
        return {"status": "created", "id": str(log.id)}
