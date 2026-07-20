param([string]$Theme = "default")

$ErrorActionPreference = "Stop"
$kladenDir = "$env:USERPROFILE\.kladen"
$spaPath = "$env:APPDATA\Spotify\Apps\xpui.spa"
$tmpDir = "$env:TEMP\kladen-tmp"

# Check files
if (-not (Test-Path $spaPath)) { Write-Host "xpui.spa not found!" -ForegroundColor Red; exit 1 }
$themeCss = "$kladenDir\themes\$Theme.css"
if (-not (Test-Path $themeCss)) { Write-Host "Theme '$Theme' not found!" -ForegroundColor Red; exit 1 }

Write-Host "Backing up..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "$kladenDir\backup" -Force | Out-Null
Copy-Item $spaPath "$kladenDir\backup\xpui.spa" -Force

Write-Host "Extracting xpui.spa..." -ForegroundColor Cyan
if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($spaPath, $tmpDir)

$htmlPath = "$tmpDir\index.html"
$html = Get-Content $htmlPath -Raw

# Inject CSS theme
$css = Get-Content $themeCss -Raw
$cssTag = "<style id=`"kladen-css`">$css</style>"
if ($html -match "kladen-css") {
  $html = $html -replace '<style id="kladen-css">[\s\S]*?</style>', $cssTag
} else {
  $html = $html -replace '</head>', "  $cssTag`n</head>"
}

# Inject JS extensions
$extDir = "$kladenDir\extensions"
if (Test-Path $extDir) {
  Get-ChildItem "$extDir\*.js" | ForEach-Object {
    $js = Get-Content $_.FullName -Raw
    $extId = "kladen-$($_.BaseName)"
    $jsTag = "<script id=`"$extId`">$js</script>"
    if ($html -match $extId) {
      $html = $html -replace "<script id=`"$extId`">[\s\S]*?</script>", $jsTag
    } else {
      $html = $html -replace '</body>', "  $jsTag`n</body>"
    }
    Write-Host "  + Extension: $($_.Name)" -ForegroundColor Gray
  }
}

Set-Content $htmlPath $html -NoNewline

Write-Host "Repacking xpui.spa..." -ForegroundColor Cyan
Remove-Item $spaPath -Force
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmpDir, $spaPath)
Remove-Item $tmpDir -Recurse -Force

Write-Host "Theme '$Theme' applied! Restart Spotify." -ForegroundColor Green
