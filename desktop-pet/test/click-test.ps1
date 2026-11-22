# Real mouse + keyboard test on Windows (used by the GitHub build):
# click the bear (left and right), hide and bring him back (desktop icon and Ctrl+Alt+B), click again.
param([string]$Exe = "dist\win-unpacked\Love Bear.exe", [string]$Label = "new")
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Input {
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, int dx, int dy, uint data, UIntPtr extra);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra);
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int index);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@
[Input]::SetProcessDPIAware() | Out-Null
$sw = [Input]::GetSystemMetrics(0); $sh = [Input]::GetSystemMetrics(1)
$log = Join-Path $env:RUNNER_TEMP "love-bear-$Label.log"
Remove-Item $log -ErrorAction SilentlyContinue
$env:LOVE_BEAR_TEST_LOG = $log
Get-Process -Name 'Love Bear' -ErrorAction SilentlyContinue | Stop-Process -Force
$exePath = (Resolve-Path $Exe).Path
Start-Process $exePath
Start-Sleep 7

function Events($type) { if (-not (Test-Path $log)) { return @() }; @(Get-Content $log | ForEach-Object { $_ | ConvertFrom-Json } | Where-Object { $_.type -eq $type }) }
function Actions { (Events 'action').Count }
function Pos { Events 'pos' | Select-Object -Last 1 }
function Move-To([int]$x, [int]$y) {   # real mouse movement (goes through the same path as a hand on the mouse)
  [Input]::mouse_event(0x8001, [int]($x * 65535 / ($sw - 1)), [int]($y * 65535 / ($sh - 1)), 0, [UIntPtr]::Zero)
}
function Click-Bear([bool]$right) {
  $p = Pos
  Move-To 60 60; Start-Sleep -Milliseconds 400
  foreach ($k in 1..6) { Move-To ([int](60 + ($p.x - 60) * $k / 6)) ([int](60 + ($p.y - 60) * $k / 6)); Start-Sleep -Milliseconds 60 }
  Start-Sleep -Milliseconds 500
  if ($right) { $d = 0x0008; $u = 0x0010 } else { $d = 0x0002; $u = 0x0004 }
  [Input]::mouse_event($d, 0, 0, 0, [UIntPtr]::Zero); Start-Sleep -Milliseconds 80
  [Input]::mouse_event($u, 0, 0, 0, [UIntPtr]::Zero); Start-Sleep -Milliseconds 1500
  Move-To 60 60; Start-Sleep -Milliseconds 2600      # let the action finish
}
function Press-Hotkey {                                # Ctrl+Alt+B
  foreach ($vk in 0x11, 0x12, 0x42) { [Input]::keybd_event($vk, 0, 0, [UIntPtr]::Zero) }
  Start-Sleep -Milliseconds 80
  foreach ($vk in 0x42, 0x12, 0x11) { [Input]::keybd_event($vk, 0, 2, [UIntPtr]::Zero) }
}
$results = [ordered]@{}
$n = Actions; Click-Bear $false; $results['left click'] = (Actions) -gt $n
$n = Actions; Click-Bear $true;  $results['right click'] = (Actions) -gt $n
Start-Process $exePath; Start-Sleep 3                  # opening Love Bear again (desktop icon) hides him...
$hid1 = (Pos).hidden
Start-Process $exePath; Start-Sleep 3                  # ...and again brings him back
$n = Actions; Click-Bear $false; $results['click after desktop-icon hide/show'] = (Actions) -gt $n
Press-Hotkey; Start-Sleep 3; $hid2 = (Pos).hidden
Press-Hotkey; Start-Sleep 3
$n = Actions; Click-Bear $false; $results['click after Ctrl+Alt+B hide/show'] = (Actions) -gt $n
$results['desktop icon hid him'] = [bool]$hid1
$results['Ctrl+Alt+B hid him'] = [bool]$hid2
Get-Process -Name 'Love Bear' -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "=== click test ($Label) ==="
$results.GetEnumerator() | ForEach-Object { Write-Host ("{0,-38} {1}" -f $_.Key, $(if ($_.Value) { 'OK' } else { 'FAILED' })) }
Write-Host "--- events (without positions) ---"
Get-Content $log | Where-Object { $_ -notmatch '"type":"pos"' } | Select-Object -Last 30
if ($results.Values -contains $false) { exit 1 }
