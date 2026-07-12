$ErrorActionPreference = 'Stop'

$taskName = 'Hermes Citadel Production V1'
$projectRoot = Split-Path -Parent $PSScriptRoot
$tailscale = 'C:\Program Files\Tailscale\tailscale.exe'
$serviceScript = Join-Path $projectRoot 'scripts\run-citadel-service.ps1'
$userId = "$env:USERDOMAIN\$env:USERNAME"

$action = New-ScheduledTaskAction `
  -Execute 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$serviceScript`""

$logonTrigger = New-ScheduledTaskTrigger -AtLogOn -User $userId

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -DontStopOnIdleEnd `
  -StartWhenAvailable `
  -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -MultipleInstances IgnoreNew `
  -Hidden

$principal = New-ScheduledTaskPrincipal `
  -UserId $userId `
  -LogonType Interactive `
  -RunLevel Limited

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $logonTrigger `
  -Settings $settings `
  -Principal $principal `
  -Description 'Hermes Citadel V1 on port 4175 with a one-minute watchdog for Tailscale Funnel.' `
  -Force | Out-Null

Start-ScheduledTask -TaskName $taskName

if (-not (Test-Path -LiteralPath $tailscale)) {
  throw "Tailscale CLI not found at $tailscale"
}

& $tailscale funnel --bg --https=10000 --yes http://127.0.0.1:4175

Write-Output 'Hermes Citadel remote access configured:'
Write-Output 'https://hermes-os-panel.tail03d525.ts.net:10000/'
