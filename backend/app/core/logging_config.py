"""Centralized logging configuration for ExamGuard AI backend."""
import logging
import sys
import os
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """JSON-like structured log formatter for production readiness."""

    def format(self, record):
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Add extra fields if present
        for key in ("user_id", "action", "method", "path", "status_code", "duration_ms", "ip"):
            val = getattr(record, key, None)
            if val is not None:
                log_entry[key] = val

        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)

        parts = [f"{k}={v}" for k, v in log_entry.items()]
        return " | ".join(parts)


def setup_logging():
    """Configure application-wide logging."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    # Root logger
    root = logging.getLogger("examguard")
    root.setLevel(getattr(logging, log_level, logging.INFO))

    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root.addHandler(handler)

    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("beanie").setLevel(logging.WARNING)

    return root


def get_logger(name: str) -> logging.Logger:
    """Get a child logger under the examguard namespace."""
    return logging.getLogger(f"examguard.{name}")
