@echo off
echo ========================================
echo    Nebula Encode - Build Script
echo ========================================
echo.

echo Checking if Node.js is installed...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Checking if dependencies are installed...
if not exist "node_modules\" (
    echo Installing dependencies...
    echo This may take 2-3 minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

echo Building Windows installer...
echo This may take 2-5 minutes...
echo.
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Your installer is ready in the 'dist' folder:
    echo   dist\NebulaEncode-Setup-1.0.0.exe
    echo.
    echo You can now share this file with your friends!
    echo They just need to run it - no other software needed.
    echo.
    echo Opening dist folder...
    start "" "%~dp0dist"
) else (
    echo.
    echo ========================================
    echo   BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
