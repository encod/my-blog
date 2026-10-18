@echo off
chcp 65001 >nul
title 部署到 Gitee Pages
cd /d "%~dp0.."

REM ============================================================
REM  一键部署到 Gitee Pages（gh-pages 分支）
REM
REM  重要背景：dist 目录里有一个独立的 git 仓库（.git），
REM  而 Vite 构建时会清空整个 dist 目录 —— 包括 .git！
REM  所以脚本先把 .git 临时移出，构建完成后再放回去。
REM ============================================================

if exist "dist\.git" (
    if exist ".git-dist-tmp" rmdir /s /q ".git-dist-tmp"
    move "dist\.git" ".git-dist-tmp" >nul
    echo [准备] 已临时移出 dist\.git，避免被构建清空
)

echo [1/4] 构建生产版本（base=/my-blog/）
call npm run build -- --base /my-blog/
if errorlevel 1 (
    echo.
    echo 构建失败，已中止。
    if exist ".git-dist-tmp" move ".git-dist-tmp" "dist\.git" >nul
    pause
    exit /b 1
)

if exist ".git-dist-tmp" (
    move ".git-dist-tmp" "dist\.git" >nul
    echo [还原] dist\.git 已放回
)

echo [2/4] 提交产物
cd dist
git add -A
git commit -m "更新站点 %date% %time%"
if errorlevel 1 echo      （无文件变化，跳过提交）

echo [3/4] 推送到 gh-pages 分支
git push -f origin gh-pages
if errorlevel 1 (
    echo.
    echo 推送失败，请检查 SSH 密钥或网络。
    cd ..
    pause
    exit /b 1
)
cd ..

echo [4/4] 完成
echo.
echo   代码已推送到 gh-pages 分支。
echo   接下来打开仓库页 → 顶部「服务」→ Gitee Pages → 点「更新」
echo.
echo   站点地址：https://ACaiYaTou.gitee.io/my-blog/
echo.
start "" "https://gitee.com/ACaiYaTou/my-blog"
pause
