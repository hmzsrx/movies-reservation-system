@echo off
cd "C:\Users\Admin\Desktop\movie reservation system"
git add .
git commit -m "Hardcode DockerHub username to fix invalid tag error"
git push
echo.
echo ====================================
echo Push complete! GitHub Actions should run now.
echo ====================================
pause

