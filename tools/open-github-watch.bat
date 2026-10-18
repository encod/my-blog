@echo off
chcp 65001 >nul
title GitHub 可用性监听
echo ============================================
echo  GitHub 可用性监听器
echo  GitHub 网页在国内常被间歇性拦截，
echo  这个脚本会一直探测，一旦能访问就自动打开浏览器。
echo  窗口通常只持续几分钟，打开后请尽快操作。
echo  不需要时直接关闭本窗口即可。
echo ============================================
echo.

set URL=https://github.com/new
set CODEFILE=%TEMP%\gh_status_code.txt

:loop
curl -s -o nul -w "%{http_code}" --noproxy "*" --max-time 6 https://github.com/ > "%CODEFILE%" 2>nul
set /p CODE=<"%CODEFILE%"

echo [%time%] 状态码: %CODE%

if "%CODE%"=="200" goto opened
if "%CODE%"=="301" goto opened
if "%CODE%"=="302" goto opened

timeout /t 8 /nobreak >nul
goto loop

:opened
echo.
echo  检测到 GitHub 可访问，正在打开浏览器...
start "" "%URL%"
echo  已打开 %URL%
echo.
echo  提示：如果页面转圈打不开，说明窗口已过，
echo  回到本窗口按任意键继续监听下一次。
echo.
pause
goto loop
