"""
email_service.py — Async email sending via Gmail SMTP.

Uses aiosmtplib for non-blocking SMTP operations.
Requires environment variables:
  EMAIL_USER  — Gmail address (e.g. examguard.ai@gmail.com)
  EMAIL_PASS  — Gmail App Password (NOT your real password)
  FRONTEND_URL — Frontend URL for verification/reset links
"""
import os
import httpx
from app.core.logging_config import get_logger

logger = get_logger("email")

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


async def _send_email(to: str, subject: str, html_body: str):
    """Send an email via Resend API (async, non-blocking HTTP)."""
    if not RESEND_API_KEY:
        logger.error(
            "EMAIL NOT SENT — RESEND_API_KEY is empty in .env! "
            "Cannot send email to %s. Please configure Resend credentials.", to
        )
        raise RuntimeError(
            "Email credentials not configured. Set RESEND_API_KEY in .env"
        )

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "from": f"ExamGuard AI <{RESEND_FROM_EMAIL}>",
        "to": [to],
        "subject": subject,
        "html": html_body
    }

    try:
        logger.info("Sending email to %s via Resend API...", to)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                json=payload,
                headers=headers,
                timeout=15.0
            )

        if response.status_code in (200, 201):
            logger.info("✓ Email sent successfully to %s: %s", to, subject)
        else:
            logger.error("Resend API rejected the email request: %s", response.text)
            raise Exception(f"Failed to send email via Resend: {response.text}")
            
    except Exception as e:
        logger.error("Unexpected error sending email via Resend to %s: %s", to, str(e))
        raise


async def send_reset_password_email(to: str, token: str):
    """Send password reset link."""
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1e3a5f; font-size: 28px; margin: 0;">ExamGuard AI</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Secure Assessment Platform</p>
        </div>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 12px;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                We received a request to reset your password. Click the button below to choose a new password.
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{reset_url}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                    Reset Password
                </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                This link expires in 30 minutes. If you didn't request a password reset, please ignore this email.
            </p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
            © 2026 ExamGuard AI. All rights reserved.
        </p>
    </div>
    """
    await _send_email(to, "Reset your ExamGuard AI password", html)
