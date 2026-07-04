$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$packageDir = Join-Path $workspace "extension-download-package"
$extensionSource = Join-Path $workspace "apps\extension"
$extensionTarget = Join-Path $packageDir "Extension"
$downloadZip = Join-Path $workspace "apps\web\public\downloads\CommunityLeadAssistant.zip"
$legacyDownloadZip = Join-Path $workspace "apps\web\public\downloads\community-lead-assistant-extension.zip"
$rootZip = Join-Path $workspace "CommunityLeadAssistant.zip"
$legacyRootZip = Join-Path $workspace "community-lead-assistant-extension.zip"
$userZip = Join-Path $env:USERPROFILE "Downloads\CommunityLeadAssistant.zip"
$userFolder = Join-Path $env:USERPROFILE "Downloads\CommunityLeadAssistant"

function Assert-InWorkspace($path) {
  $fullPath = [System.IO.Path]::GetFullPath($path)
  if (-not $fullPath.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing path outside workspace: $fullPath"
  }
}

Assert-InWorkspace $extensionTarget
if (Test-Path -LiteralPath $extensionTarget) {
  Remove-Item -LiteralPath $extensionTarget -Recurse -Force
}

New-Item -ItemType Directory -Path $extensionTarget | Out-Null
Copy-Item -Path (Join-Path $extensionSource "*") -Destination $extensionTarget -Recurse -Force

foreach ($zipPath in @($downloadZip, $legacyDownloadZip, $rootZip, $legacyRootZip, $userZip)) {
  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }
}

Compress-Archive -Path (Join-Path $packageDir "*") -DestinationPath $downloadZip -Force
Copy-Item -LiteralPath $downloadZip -Destination $legacyDownloadZip -Force
Copy-Item -LiteralPath $downloadZip -Destination $rootZip -Force
Copy-Item -LiteralPath $downloadZip -Destination $legacyRootZip -Force
Copy-Item -LiteralPath $downloadZip -Destination $userZip -Force

if (Test-Path -LiteralPath $userFolder) {
  Remove-Item -LiteralPath $userFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $userFolder | Out-Null
Copy-Item -Path (Join-Path $packageDir "*") -Destination $userFolder -Recurse -Force

Write-Host "Extension package rebuilt:"
Write-Host " - $downloadZip"
Write-Host " - $userZip"
Write-Host "Load this folder in Chrome:"
Write-Host " - $(Join-Path $userFolder 'Extension')"
