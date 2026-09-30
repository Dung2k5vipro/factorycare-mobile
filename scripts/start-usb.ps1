$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (Test-Path $adb) {
    Write-Host "[USB Mode] Dang cau hinh chuyen tiep cong qua ADB..." -ForegroundColor Cyan
    & $adb reverse tcp:8081 tcp:8081
    & $adb reverse tcp:3005 tcp:3005
    Write-Host "[USB Mode] Da reverse port 8081 & 3005 thanh cong." -ForegroundColor Green
} else {
    Write-Host "[USB Mode] Khong tim thay adb.exe. Dang tiep tuc chay Expo..." -ForegroundColor Yellow
}

$env:EXPO_PUBLIC_API_BASE_URL = "http://127.0.0.1:3005/api"
$env:REACT_NATIVE_PACKAGER_HOSTNAME = "127.0.0.1"

# Dung --lan de Metro lang nghe tren IPv4 (0.0.0.0). Dia chi quang ba cho
# dien thoai van la 127.0.0.1 nho REACT_NATIVE_PACKAGER_HOSTNAME va ADB reverse.
npx expo start --lan -c
