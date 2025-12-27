@echo off
set "NODE_PATH=C:\Users\z004xh1j\.gemini\node\node-v20.10.0-win-x64"
set "PATH=%NODE_PATH%;%PATH%"

echo Node.js path set to %NODE_PATH%
echo Starting development server...

call npm run dev
pause
