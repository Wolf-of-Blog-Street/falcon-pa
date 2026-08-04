@echo off
rem brain — the one way to run the memory engine (Windows twin of bin/brain).
setlocal
set "BRAIN_ROOT=%~dp0.."
set "NODE_NO_WARNINGS=1"
node "%~dp0..\src\brain\brain.mjs" %*
exit /b %ERRORLEVEL%
