Write-Host "[QR Wi-Fi Mode] Dang khoi dong Expo qua mang LAN Wi-Fi..." -ForegroundColor Cyan
$env:EXPO_PUBLIC_API_BASE_URL = "auto"
npx expo start --lan -c
