@echo off
set "NODE_PATH=C:\Users\z004xh1j\.gemini\node\node-v20.10.0-win-x64"
set "PATH=%NODE_PATH%;%PATH%"

echo ===================================================
echo Starting Resume ATS Analyzer (Local Mode)
echo ===================================================
echo.
echo This will start the application in Development Mode.
echo Any changes you make to the code will update instantly.
echo.

call npm run dev
pause
