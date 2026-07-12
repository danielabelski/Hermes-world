$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeExecutable = 'C:\Users\User\AppData\Local\hermes\node\node.exe'
$stdoutLog = 'C:\tmp\hermes-citadel-service.out.log'
$stderrLog = 'C:\tmp\hermes-citadel-service.err.log'

Set-Location -LiteralPath $projectRoot

while ($true) {
  & $nodeExecutable server.js 1>> $stdoutLog 2>> $stderrLog
  Start-Sleep -Seconds 5
}
