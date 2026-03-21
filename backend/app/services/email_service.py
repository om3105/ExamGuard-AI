"""
email_service.py — Async email sending via Gmail SMTP.

Uses aiosmtplib for non-blocking SMTP operations.
Requires environment variables:
  EMAIL_USER  — Gmail address (e.g. examguard.ai@gmail.com)
  EMAIL_PASS  — Gmail App Password (NOT your real password)
  FRONTEND_URL — Frontend URL for verification/reset links
"""
import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.logging_config import get_logger

logger = get_logger("email")

EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


async def _send_email(to: str, subject: str, html_body: str):
    """Send an email via Gmail SMTP (async, non-blocking)."""
    if not EMAIL_USER or not EMAIL_PASS:
        logger.error(
            "EMAIL NOT SENT — EMAIL_USER or EMAIL_PASS is empty in .env! "
            "Cannot send email to %s. Please configure Gmail credentials.", to
        )
        raise RuntimeError(
            "Email credentials not configured. Set EMAIL_USER and EMAIL_PASS in .env"
        )

    message = MIMEMultipart("alternative")
    message["From"] = f"ExamGuard AI <{EMAIL_USER}>"
    message["To"] = to
    message["Subject"] = subject
    message.attach(MIMEText(html_body, "html"))

    try:
        logger.info("Sending email to %s via %s:%s (user=%s)...", to, EMAIL_HOST, EMAIL_PORT, EMAIL_USER)
        await aiosmtplib.send(
            message,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            start_tls=True,
            username=EMAIL_USER,
            password=EMAIL_PASS,
        )
        logger.info("✓ Email sent successfully to %s: %s", to, subject)
    except aiosmtplib.SMTPAuthenticationError as e:
        logger.error(
            "SMTP AUTH FAILED — Gmail rejected credentials. "
            "Make sure EMAIL_PASS is a Gmail App Password (not your real password). Error: %s", str(e)
        )
        raise
    except aiosmtplib.SMTPException as e:
        logger.error("SMTP error sending to %s: %s", to, str(e))
        raise
    except Exception as e:
        logger.error("Unexpected error sending email to %s: %s", to, str(e))
        raise


async def send_verification_email(to: str, token: str):
    """Send email verification link."""
    verify_url = f"{FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1e3a5f; font-size: 28px; margin: 0;">ExamGuard AI</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Secure Assessment Platform</p>
        </div>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 12px;">Verify Your Email</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Thank you for registering! Click the button below to verify your email address and activate your account.
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{verify_url}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                    Verify Email Address
                </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                This link expires in 24 hours. If you didn't create an account, please ignore this email.
            </p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
            © 2026 ExamGuard AI. All rights reserved.
        </p>
    </div>
    """
    await _send_email(to, "Verify your ExamGuard AI account", html)


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
