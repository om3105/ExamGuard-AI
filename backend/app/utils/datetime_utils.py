"""Utility helpers for consistent datetime handling across the API."""
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30), name="IST")

def ensure_utc_isoformat(data: dict, fields: list[str] = None) -> dict:
    """
    Convert naive datetime objects in a dict to IST-aware ISO strings.
    
    JavaScript's `new Date("2024-01-01T01:30:00")` treats timezone-less
    strings as LOCAL time. Adding the IST offset (`+05:30`) ensures the
    browser correctly converts to the user's local timezone if needed.
    """
    if fields is None:
        fields = ["start_time", "created_at", "updated_at", "submitted_at", "requested_at"]
    
    for field in fields:
        val = data.get(field)
        if val and isinstance(val, datetime):
            if val.tzinfo is None:
                val = val.replace(tzinfo=timezone.utc)
            data[field] = val.isoformat()
    
    return data
