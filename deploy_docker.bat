@echo off
echo ===================================================
echo Building for Deployment (Docker)
echo ===================================================
echo.
echo This script requires Docker Desktop to be running.
echo It will build a production-ready container image.
echo.

docker build -t resume-ats-analyzer:latest .
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker build failed. Please ensure Docker Desktop is installed and running.
    pause
    exit /b %errorlevel%
)

echo.
echo [SUCCESS] Build complete!
echo To run the container locally to test deployment:
echo docker run -p 3000:3000 resume-ats-analyzer:latest
echo.
pause
