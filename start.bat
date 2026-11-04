@echo off
title FarmShield Launcher
echo ========================================================
echo        Starting FarmShield Full-Stack Platform
echo ========================================================
echo.

echo [1/3] Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "FarmShield Backend" cmd /k "node server.js"

echo [2/3] Starting Frontend Dev Server (Port 5173)...
cd /d "%~dp0frontend"
start "FarmShield Frontend" cmd /k "npm run dev"

echo [3/3] Opening FarmShield in your browser...
timeout /t 4 >nul
start http://localhost:5173

echo.
echo FarmShield is running!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo ========================================================
