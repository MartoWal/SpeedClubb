@echo off
chcp 65001 >nul
title SPEEDCLUB // Iniciador del Sistema
color 0C

echo ===============================================================================
echo            SPEEDCLUB - MOTORSPORT STICKER ALBUM ^& PADDOCK TRADE
echo                 INICIANDO SERVIDORES FULL STACK...
echo ===============================================================================
echo.
echo [1/2] Iniciando Servidor Backend (FastAPI / SQLite) en puerto 8000...
start "SpeedClub Backend [FastAPI :8000]" cmd /k "cd server && python -m uvicorn main:app --reload --port 8000"

echo [2/2] Iniciando Servidor Frontend (React + Vite) en puerto 5173...
start "SpeedClub Frontend [React :5173]" cmd /k "cd client && npm run dev"

echo.
echo Esperando inicialización de servicios...
timeout /t 3 /nobreak >nul

echo Abriendo navegador en http://localhost:5173/ ...
start "" "http://localhost:5173/"

echo.
echo ===============================================================================
echo                 ¡SPEEDCLUB ESTÁ EN EJECUCIÓN!
echo ===============================================================================
echo.
echo  - Aplicación Web:  http://localhost:5173/
echo  - API Swagger Docs: http://localhost:8000/docs
echo.
echo Para detener los servidores, cierra las dos ventanas de consola abiertas.
echo ===============================================================================
echo.
pause
