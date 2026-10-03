@echo off
chcp 65001 >nul
cd /d "%~dp0"

if exist "dist\BraderPart.exe" (
    echo Menjalankan BraderPart...
    start "" "dist\BraderPart.exe"
    exit /b 0
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║        BraderPart - File EXE belum dibuat                ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Silakan jalankan build.bat terlebih dahulu.
echo.
pause
