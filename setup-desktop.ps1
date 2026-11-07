# Creates desktop shortcut with custom icon for Interview Tracker
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "DotNet Interview Tracker.lnk"
$Launcher = Join-Path $ProjectRoot "launch.bat"
$IconPath = Join-Path $ProjectRoot "assets\app-icon.ico"

# Generate ICO from SVG using Python if available
$SvgPath = Join-Path $ProjectRoot "client\public\favicon.svg"
$AssetsDir = Join-Path $ProjectRoot "assets"
if (-not (Test-Path $AssetsDir)) { New-Item -ItemType Directory -Path $AssetsDir | Out-Null }

python -c @"
from pathlib import Path
try:
    from PIL import Image, ImageDraw, ImageFont
    img = Image.new('RGBA', (256, 256), (81, 43, 212, 255))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype('segoeui.ttf', 52)
        font2 = ImageFont.truetype('segoeui.ttf', 36)
    except Exception:
        font = ImageFont.load_default()
        font2 = font
    draw.rounded_rectangle([8,8,248,248], radius=40, fill=(104,33,122,255))
    draw.text((128, 95), '.NET', fill='white', anchor='mm', font=font)
    draw.text((128, 165), '182', fill=(200,184,255,255), anchor='mm', font=font2)
    out = Path(r'$IconPath')
    img.save(out, format='ICO', sizes=[(256,256), (128,128), (64,64), (48,48), (32,32), (16,16)])
    print('Icon created')
except ImportError:
    print('Pillow not installed - using default icon')
"@ 2>$null

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $Launcher
$Shortcut.WorkingDirectory = $ProjectRoot
$Shortcut.WindowStyle = 7
$Shortcut.Description = "182-Day .NET Product Company Interview Tracker"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
}
$Shortcut.Save()

Write-Host "Desktop shortcut created: $ShortcutPath"
Write-Host "Double-click 'DotNet Interview Tracker' on your desktop to open the app."
