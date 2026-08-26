from app.api.core.db import SessionLocal
from app.api.models.user import User
from app.api.core.security import hash_password

def create_admin():
    db = SessionLocal()
    try:
        email = "admin@gmail.com"
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.password = hash_password("admin123")
            user.role = "admin"
            user.email_verified = True
            print("Admin user updated with email: admin@gmail.com, password: admin123")
        else:
            admin_user = User(
                name="Admin User",
                email=email,
                password=hash_password("admin123"),
                role="admin",
                email_verified=True
            )
            db.add(admin_user)
            print("Admin user created with email: admin@gmail.com, password: admin123")
        db.commit()
    except Exception as e:
        db.rollback()
        print("Error creating admin:", e)
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
