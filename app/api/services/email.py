import smtplib
from email.message import EmailMessage
import os


def send_otp_email(to_email: str, otp: str):

    message = EmailMessage()

    message["Subject"] = "Movie Reservation System - Email Verification"
    message["From"] = os.getenv("SMTP_USERNAME")
    message["To"] = to_email

    message.set_content(
        f"""
Hello,

Your email verification OTP is:

{otp}

This OTP will expire in 5 minutes.

If you did not request this OTP, please ignore this email.

Movie Reservation System
"""
    )

    with smtplib.SMTP(
        os.getenv("SMTP_HOST"),
        int(os.getenv("SMTP_PORT"))
    ) as server:

        server.starttls()

        server.login(
            os.getenv("SMTP_USERNAME"),
            os.getenv("SMTP_PASSWORD")
        )

        server.send_message(message)