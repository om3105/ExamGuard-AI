"""
behavior_routes.py — Ingests behavioral telemetry from the student exam interface.

The frontend sends DELTA-based payloads every ~15 seconds. Each payload contains
only the NEW events since the last flush. The backend accumulates these deltas
into a single BehaviorLog document per (user_id, exam_id) session.

Lookup is by user_id + exam_id (NOT submission_id) because the submission does
not exist yet during the exam — it is only created when the student submits.
"""
from fastapi import APIRouter, Depends
from app.models.all_models import BehaviorLog, User
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

router = APIRouter()


class EventEntry(BaseModel):
    """A single proctoring event (tab switch, paste, etc.)."""
    type: str           # "tab_switch", "paste", "blur", "focus"
    timestamp: str      # ISO string or epoch ms


class BehaviorLogPayload(BaseModel):
    exam_id: str
    submission_id: Optional[str] = None
    # Delta counters — only NEW events since last flush
    keystroke_count: int = 0
    avg_typing_speed: float = 0.0
    backspace_ratio: float = 0.0
    paste_count: int = 0
    pasted_chars: int = 0
    tab_switch_count: int = 0
    mouse_click_count: int = 0
    time_per_question: dict = {}
    events: List[dict] = []   # raw event timeline [{type, timestamp}]


@router.post("/log", status_code=200)
async def log_behavior(
    payload: BehaviorLogPayload,
    current_user: User = Depends(get_current_user)
):
    """
    Receive delta-based behavioral events from the exam interface.
    Accumulates deltas into the existing BehaviorLog for this session,
    or creates a new one if it doesn't exist.

    IMPORTANT: Lookup is by user_id + exam_id, NOT submission_id.
    The submission doesn't exist yet during the exam.
    """
    user_id = str(current_user.id)

    # Look up existing log by user_id + exam_id (reliable during exam)
    existing = await BehaviorLog.find_one(
        BehaviorLog.user_id == user_id,
        BehaviorLog.exam_id == payload.exam_id
    )

    if existing:
        # Accumulate delta counters
        existing.keystroke_count += max(payload.keystroke_count, 0)
        existing.paste_count += max(payload.paste_count, 0)
        existing.pasted_chars += max(payload.pasted_chars, 0)
        existing.tab_switch_count += max(payload.tab_switch_count, 0)
        existing.mouse_click_count += max(payload.mouse_click_count, 0)

        # Weighted average for typing speed (use latest if first was 0)
        if payload.avg_typing_speed > 0:
            if existing.avg_typing_speed > 0:
                existing.avg_typing_speed = round(
                    (existing.avg_typing_speed + payload.avg_typing_speed) / 2, 3
                )
            else:
                existing.avg_typing_speed = round(payload.avg_typing_speed, 3)

        # Weighted average for backspace ratio
        if payload.backspace_ratio > 0:
            if existing.backspace_ratio > 0:
                existing.backspace_ratio = round(
                    (existing.backspace_ratio + payload.backspace_ratio) / 2, 3
                )
            else:
                existing.backspace_ratio = round(payload.backspace_ratio, 3)

        # Merge time_per_question (additive)
        for key, val in payload.time_per_question.items():
            existing.time_per_question[key] = existing.time_per_question.get(key, 0) + val

        # Append raw events (capped at 500 to prevent unbounded growth)
        if payload.events:
            remaining_capacity = 500 - len(existing.events)
            if remaining_capacity > 0:
                existing.events.extend(payload.events[:remaining_capacity])

        # Update submission_id if provided (late-binding)
        if payload.submission_id:
            existing.submission_id = payload.submission_id

        existing.recorded_at = datetime.now(timezone.utc)
        await existing.save()
        return {"status": "updated", "id": str(existing.id)}
    else:
        # Create new log
        log = BehaviorLog(
            submission_id=payload.submission_id or "",
            user_id=user_id,
            exam_id=payload.exam_id,
            keystroke_count=max(payload.keystroke_count, 0),
            avg_typing_speed=round(max(payload.avg_typing_speed, 0), 3),
            backspace_ratio=round(max(payload.backspace_ratio, 0), 3),
            paste_count=max(payload.paste_count, 0),
            pasted_chars=max(payload.pasted_chars, 0),
            tab_switch_count=max(payload.tab_switch_count, 0),
            mouse_click_count=max(payload.mouse_click_count, 0),
            time_per_question=payload.time_per_question,
            events=payload.events[:500] if payload.events else [],
        )
        await log.insert()
        return {"status": "created", "id": str(log.id)}
