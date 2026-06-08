@echo off
echo ==============================
echo   英语打字练习 - 启动中...
echo ==============================

:: 启动 Vite 开发服务器
echo [1/2] 启动 Vite...
start /b cmd /c "cd /d %~dp0 && npx vite > vite.log 2>&1"

:: 等待 Vite 启动
echo [2/2] 等待服务就绪...
timeout /t 5 /nobreak > nul

:: 读取端口号
for /f "tokens=*" %%a in ('type vite.log ^| findstr "Local:"') do set VITE_LINE=%%a
for /f "tokens=3 delims=:" %%a in ("%VITE_LINE%") do set PORT=%%a
set PORT=%PORT:~1,-1%

echo.
echo Vite 已启动: http://localhost:%PORT%
echo 启动 Electron...
echo.

:: 启动 Electron
set VITE_PORT=%PORT%
npx electron .

:: 清理
taskkill /F /IM node.exe > nul 2>&1
del vite.log > nul 2>&1
