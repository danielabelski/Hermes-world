$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$env:PORT = '4176'
Set-Location -LiteralPath $projectRoot
& node.exe server.js
