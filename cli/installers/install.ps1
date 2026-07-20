param(
  [string]$InstallDir = "$env:USERPROFILE\.kladen"
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/YOUR_USERNAME/kladen/raw/main"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Kladen - Spotify Customization Tool" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
  Write-Host "Node.js is required. Download from https://nodejs.org" -ForegroundColor Red
  exit 1
}
Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Cyan

# Create install directory
Write-Host "Installing to: $InstallDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

# Create themes dir
New-Item -ItemType Directory -Path "$InstallDir\themes" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\config" -Force | Out-Null

# Download CLI files
$files = @(
  "cli/package.json",
  "cli/bin/kladen.js",
  "cli/src/commands/apply.js",
  "cli/src/commands/backup.js",
  "cli/src/commands/restore.js",
  "cli/src/commands/config.js",
  "cli/src/commands/list.js",
  "cli/src/core/spotify.js",
  "cli/src/core/injector.js"
)

foreach ($file in $files) {
  $dest = Join-Path $InstallDir $file
  $dir = Split-Path $dest -Parent
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  try {
    $url = "$RepoUrl/$file"
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    Write-Host "  Downloaded: $file" -ForegroundColor Gray
  } catch {
    Write-Host "  Failed: $file" -ForegroundColor Red
  }
}

# Install npm dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan
Set-Location -Path $InstallDir
npm install

# Download default themes
$themes = @("default.css", "nord.css", "dark-purple.css")
foreach ($theme in $themes) {
  $url = "$RepoUrl/cli/themes/$theme"
  $dest = "$InstallDir\themes\$theme"
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    Write-Host "  Downloaded theme: $theme" -ForegroundColor Gray
  } catch {}
}

# Add to PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$cliPath = "$InstallDir\cli\node_modules\.bin"
$cliBinPath = "$InstallDir\cli\bin"

if ($userPath -notlike "*$cliPath*") {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$cliPath", "User")
  Write-Host ""
  Write-Host "Added to PATH. Restart your terminal or run:" -ForegroundColor Yellow
  Write-Host "  `$env:Path += `";$cliPath`"" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Quick start:" -ForegroundColor Cyan
Write-Host "  kladen apply default    # Apply default theme"
  Write-Host "  kladen apply nord       # Apply Nord theme"
  Write-Host "  kladen list             # List themes"
  Write-Host "  kladen backup           # Backup Spotify"
  Write-Host "  kladen restore          # Restore backup"
Write-Host ""
Write-Host "Add your own themes in: $InstallDir\themes\" -ForegroundColor Cyan
