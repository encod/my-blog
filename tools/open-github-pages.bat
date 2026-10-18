@echo off
chcp 65001 >nul
title GitHub Pages 开通助手
setlocal enabledelayedexpansion

set "URL=https://github.com/encod/my-blog/settings/pages"
set "PROBE=https://github.com/"

echo ============================================================
echo   GitHub Pages 开通助手
echo ============================================================
echo.
echo   你的网络到 github.com 是间歇性可达的（约几分钟一个窗口）。
echo   本脚本每 8 秒探测一次，一旦可用就自动打开浏览器到：
echo.
echo     %URL%
echo.
echo   打开后请（如果已登录）：
echo     Settings ^-^> Pages ^-^> Build and deployment
echo     Source 选 "GitHub Actions" ^-^> Save
echo.
echo   然后回到命令行按回车，我会帮你触发一次部署。
echo   按 Ctrl+C 可随时退出。
echo ============================================================
echo.
echo 开始探测...
echo.

:LOOP
for /f "delims=" %%i in ('curl -s -o NUL -w "%%{http_code}" --max-time 6 %PROBE% 2^>NUL') do set CODE=%%i
echo [%time:~0,8%] 状态: %CODE%

if "%CODE%"=="200" (
    echo.
    echo   可用！正在打开浏览器...
    start "" "%URL%"
    echo   已打开。请在浏览器里完成 Source 选择后，回到这里按回车。
    echo.
    pause
    goto AFTER
)

timeout /t 8 /nobreak >nul
goto LOOP

:AFTER
echo.
echo 正在触发一次部署（推送空提交）...
cd /d "%~dp0.."
git commit --allow-empty -m "chore: 触发 Pages 部署" >nul 2>&1
git push origin main 2>&1 | findstr /i "main -> main Everything up-to-date" >nul
if errorlevel 1 (
    git push origin main
) else (
    echo   已推送，Actions 正在构建。
)
echo.
echo 完成后访问：https://encod.github.io/my-blog/
echo.
pause
