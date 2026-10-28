@echo off
chcp 65001 >nul
title SPEEDCLUB // Instalador Automático de Dependencias
color 0C

echo ===============================================================================
echo            SPEEDCLUB - MOTORSPORT STICKER ALBUM ^& PADDOCK TRADE
echo                 INSTALADOR AUTOMÁTICO DE DEPENDENCIAS
echo ===============================================================================
echo.

echo [1/4] Verificando instalación de Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no está instalado o no se encuentra en la variable PATH del sistema.
    echo Por favor, descarga e instala Python desde: https://www.python.org/downloads/
    echo Recuerda marcar la casilla "Add python.exe to PATH" durante la instalación.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do echo    ✓ Detectado: %%i
echo.

echo [2/4] Verificando instalación de Node.js y NPM...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado o no se encuentra en el PATH del sistema.
    echo Por favor, descarga e instala Node.js (LTS) desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo    ✓ Detectado Node.js: %%i
for /f "tokens=*" %%i in ('npm --version') do echo    ✓ Detectado NPM: v%%i
echo.

echo [3/4] Instalando dependencias del Servidor Backend (Python / FastAPI)...
echo    Ejecutando: pip install -r requirements.txt
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Ocurrió un error al instalar librerías con pip.
    echo Verifica tu conexión a internet o los permisos de administrador.
) else (
    echo    ✓ Librerías de Python instaladas con éxito.
)
echo.

echo [4/4] Instalando dependencias del Frontend (React / Vite / Tailwind)...
echo    Ingresando a carpeta client y ejecutando: npm install
cd client
call npm install
cd ..
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Ocurrió un error al instalar los paquetes de Node en client.
) else (
    echo    ✓ Paquetes de React y Vite instalados con éxito.
)
echo.

color 0A
echo ===============================================================================
echo                      ¡INSTALACIÓN COMPLETADA CON ÉXITO!
echo ===============================================================================
echo.
echo Para iniciar el sistema en esta computadora tienes dos opciones:
echo.
echo   OPCIÓN 1 (Automática de 1 clic):
echo     Haz doble clic en el archivo "iniciar.bat" ubicado en esta carpeta.
echo.
echo   OPCIÓN 2 (Manual en Visual Studio Code):
echo     - Terminal 1: cd server ^&^& python -m uvicorn main:app --reload --port 8000
echo     - Terminal 2: cd client ^&^& npm run dev
echo.
echo ===============================================================================
echo.
set /p arrancar="¿Deseas iniciar SpeedClub ahora mismo? (S/N): "
if /i "%arrancar%"=="S" (
    start "" "%~dp0iniciar.bat"
)
pause
