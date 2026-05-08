@echo off
title Rekening Checker Web App - Start
color 0A

cls
echo.
echo  ==========================================
echo     REKENING CHECKER WEB APP - START
echo  ==========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python tidak ditemukan!
    echo SILAHKAN INSTALL PYTHON DULU:
    echo 1. Buka browser ke: https://python.org
    echo 2. Download Python 3.10 atau lebih baru
    echo 3. Install dengan centang "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo Python terinstall.
echo.

:: Check if Node.js is installed (optional)
node --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Node.js tidak ditemukan (opsional)
    echo Install Node.js dari: https://nodejs.org/ untuk fitur tambahan
    echo.
) else (
    echo Node.js terinstall.
    echo.
)

:: Start local server
echo Starting local server...
echo Server akan berjalan di: http://localhost:8000
echo.
echo Tekan CTRL+C untuk stop server
echo.

:: Try Python HTTP server
python -m http.server 8000 2>nul
if errorlevel 1 (
    echo.
    echo Python HTTP server gagal, coba alternatif...
    
    :: Try Node.js serve
    npx serve -p 8000 -s . 2>nul
    if errorlevel 1 (
        echo.
        echo ERROR: Tidak bisa start server!
        echo.
        echo ALTERNATIF:
        echo 1. Double-click index.html langsung di Chrome
        echo 2. Install Python/Node.js yang benar
        echo 3. Gunakan web server lain (XAMPP, WAMP, dll)
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Server stopped.
pause
