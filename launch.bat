@echo off
title .NET Interview Tracker
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install from https://nodejs.org
  pause
  exit /b 1
)

if not exist "client\dist\index.html" (
  echo Building app for first time...
  call npm install
  cd client
  call npm install
  cd ..
  call npm run build
)

if not exist "node_modules" (
  call npm install
)

echo Starting Interview Tracker...
start "" "http://localhost:3847"
node server/index.js
