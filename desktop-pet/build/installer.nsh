; Love Bear installer extras.
; When a new version is installed, close the running Love Bear by itself (no "app is running" message),
; then the installer removes the old version and starts the new one.
!macro customCheckAppRunning
  nsExec::Exec `taskkill /f /t /im "${APP_EXECUTABLE_FILENAME}"`
  Pop $0
  Sleep 800
!macroend
