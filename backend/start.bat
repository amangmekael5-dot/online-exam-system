@echo off
echo === Exam App Startup ===

echo [1/3] Starting MongoDB...
start "MongoDB" /min "..\mongodb-win32-x86_64-windows-8.3.4\bin\mongod.exe" --dbpath "C:\data\db"

echo [2/3] Waiting 5 seconds for MongoDB to initialize...
timeout /t 5 /nobreak >nul

echo [3/3] Starting Backend Server...
node server.js
