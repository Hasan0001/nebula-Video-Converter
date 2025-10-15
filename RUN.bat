@echo off
echo ========================================
echo    Nebula Encode - Development Mode
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

echo Starting Nebula Encode...
echo.
echo The app window will open shortly...
echo Press Ctrl+C to stop the app.
echo.

call npm start
