@echo off
powershell -ExecutionPolicy Bypass -NoProfile -Command ^
  "$spa = Join-Path $env:APPDATA 'Spotify\Apps\xpui.spa';" ^
  "$tmp = Join-Path $env:TEMP 'kld';" ^
  "Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
  "if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force };" ^
  "[System.IO.Compression.ZipFile]::ExtractToDirectory($spa, $tmp);" ^
  "$html = Join-Path $tmp 'index.html';" ^
  "$h = Get-Content $html -Raw;" ^
  "$cssPath = Join-Path $env:USERPROFILE '.kladen\themes\default.css';" ^
  "$storePath = Join-Path $env:USERPROFILE '.kladen\extensions\store.js';" ^
  "$css = Get-Content $cssPath -Raw;" ^
  "$store = Get-Content $storePath -Raw;" ^
  "$h = $h.Replace('</head>', '<style id=\"kladen-css\">' + $css + '</style></head>');" ^
  "$h = $h.Replace('</body>', '<script id=\"kladen-store\">' + $store + '</script></body>');" ^
  "Set-Content $html $h -NoNewline;" ^
  "Remove-Item $spa -Force;" ^
  "[System.IO.Compression.ZipFile]::CreateFromDirectory($tmp, $spa);" ^
  "Remove-Item $tmp -Recurse -Force;" ^
  "Write-Host 'Kladen applied! Restart Spotify.' -ForegroundColor Green"
