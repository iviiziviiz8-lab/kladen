param(
  [string]$InstallDir = "$env:USERPROFILE\.kladen"
)

$ErrorActionPreference = "Stop"
$RepoBase = "https://raw.githubusercontent.com/iviiziviiz8-lab/kladen/master"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Kladen - Spotify Customization" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
try { $nodeVer = node --version } catch { $nodeVer = $null }
if (-not $nodeVer) {
  Write-Host "Node.js is required. Download from https://nodejs.org" -ForegroundColor Red
  exit 1
}
Write-Host "Node.js: $nodeVer" -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Path "$InstallDir\bin" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\themes" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\extensions" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\config" -Force | Out-Null

# Download CLI
Write-Host "Downloading kladen..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "$RepoBase/cli/bin/kladen.js" -OutFile "$InstallDir\bin\kladen.js" -UseBasicParsing

# Download built-in themes
Write-Host "Downloading themes..." -ForegroundColor Cyan
@("default.css", "nord.css", "dark-purple.css") | ForEach-Object {
  $url = "$RepoBase/cli/themes/$_"
  $dest = "$InstallDir\themes\$_"
  try { Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing } catch {}
}

# Download store extension
Write-Host "Downloading store extension..." -ForegroundColor Cyan
try {
  Invoke-WebRequest -Uri "$RepoBase/cli/extensions/store.js" -OutFile "$InstallDir\extensions\store.js" -UseBasicParsing
} catch {}

# Create launcher script
$launcherPath = "$InstallDir\kladen.cmd"
@"
@echo off
node "%~dp0bin\kladen.js" %*
"@ | Out-File -FilePath $launcherPath -Encoding ASCII

# Add to PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$InstallDir*") {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$InstallDir", "User")
  Write-Host ""
  Write-Host "Added to PATH. Restart your terminal or run:" -ForegroundColor Yellow
  Write-Host "  `$env:Path += `";$InstallDir`"" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Quick start:" -ForegroundColor Cyan
Write-Host "  kladen apply default     Apply default theme"
Write-Host "  kladen apply nord        Apply Nord theme"
Write-Host "  kladen list              List themes"
Write-Host "  kladen backup            Backup Spotify"
Write-Host "  kladen restore           Restore backup"
Write-Host ""
Write-Host "Theme folder: $InstallDir\themes\" -ForegroundColor Cyan
Write-Host "Add your own .css files there!"
