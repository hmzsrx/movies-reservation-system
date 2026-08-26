from app.api.core.database import SessionLocal
from app.api.core.security import hash_password
from app.api.models.user import User


def seed_admin_user() -> None:
    db = SessionLocal()
    try:
        email = "admin@gmail.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            admin_user = User(
                name="Admin",
                email=email,
                password=hash_password("admin"),
                role="admin",
                email_verified=True
            )
            db.add(admin_user)
            db.commit()
        
        else:
            user.password = hash_password("admin")
            user.role = "admin"
            user.email_verified = True
            db.commit()

        # Seed a default screen
        from app.api.models.screen import Screen
        default_screen = db.query(Screen).filter(Screen.name == "Screen 1").first()
        if not default_screen:
            new_screen = Screen(name="Screen 1", capacity=50)
            db.add(new_screen)
            db.commit()
        
    except Exception as e:
        db.rollback()

    finally:
        db.close()
