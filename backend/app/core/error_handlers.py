"""Global exception handlers for structured API error responses."""
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.logging_config import get_logger

logger = get_logger("errors")


def register_error_handlers(app: FastAPI):
    """Register global exception handlers on the FastAPI app."""

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        errors = []
        for err in exc.errors():
            field = " -> ".join(str(loc) for loc in err.get("loc", []))
            errors.append(f"{field}: {err.get('msg', 'invalid')}")
        logger.warning("Validation error on %s %s: %s", request.method, request.url.path, errors)
        return JSONResponse(
            status_code=422,
            content={"status": "error", "message": "Validation failed", "errors": errors},
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": exc.detail},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception on %s %s", request.method, request.url.path, exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "Internal server error"},
        )
