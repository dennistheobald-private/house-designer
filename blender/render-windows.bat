@echo off
rem Renders House K in Blender (free, from blender.org). Double-click to start.
setlocal
cd /d "%~dp0"
title House K - rendering in Blender

set "BLENDER="
for /f "delims=" %%B in ('where blender 2^>nul') do if not defined BLENDER set "BLENDER=%%B"
rem The newest Blender installed in the usual places (later versions sort last).
for /d %%D in ("%ProgramFiles%\Blender Foundation\Blender*") do if exist "%%D\blender.exe" set "BLENDER=%%D\blender.exe"
if not defined BLENDER if exist "%ProgramFiles(x86)%\Steam\steamapps\common\Blender\blender.exe" set "BLENDER=%ProgramFiles(x86)%\Steam\steamapps\common\Blender\blender.exe"

if not defined BLENDER (
  echo Blender is not installed yet. It is free: the download page opens now.
  echo Install it, then double-click "Render on Windows" again.
  start "" "https://www.blender.org/download/"
  pause
  exit /b 1
)

echo Rendering with %BLENDER%
echo This window shows the progress. Leave it open; it can take a while.
echo.
"%BLENDER%" --background --python "%~dp0render_house.py" -- %*
echo.
if exist "%~dp0renders" start "" "%~dp0renders"
echo Done. The photos and the video are in the "renders" folder.
pause
