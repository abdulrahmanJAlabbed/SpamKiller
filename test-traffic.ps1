# Aegis Traffic Simulator (External Test Script)
# This script sends multi-language SMS messages to your Android emulator using adb.
# Usage: .\test-traffic.ps1

function Send-AegisSMS {
    param(
        [string]$Sender,
        [string]$Message
    )
    Write-Host "Sending: [$Sender] $Message" -ForegroundColor Cyan
    # Shell command to send SMS to emulator via adb
    # Note: Requires an active emulator running.
    adb emu sms send $Sender $Message
}

Write-Host "--- AEGIS TRAFFIC SIMULATOR STARTING ---" -ForegroundColor Yellow
Write-Host "Ensure your Android emulator is running and Aegis is open.`n"

# 1. English OTP (Likely Ham/OTP)
Send-AegisSMS "Aegis-Auth" "Your G-889210 security code is active for 5 minutes. Do not share."

# 2. Arabic Scam (Urgent/Bank)
Send-AegisSMS "66201" "عزيزي العميل، تم تجميد حسابك البنكي. يرجى الضغط هنا للتنشيط فورا: http://bit.ly/bank-fix-urgent"

# 3. Japanese Phishing (Amazon)
Send-AegisSMS "AMZ-ALERT" "【重要】お客様のAmazonアカウントは制限されています。ログインして情報を更新してください: http://amazn-fix.co"

# 4. French Delivery (Chronopost)
Send-AegisSMS "Delivery" "Votre colis CH992812FR est arrive au point de collecte. Frais de garde applicables: http://laposte-check.fr"

# 5. Promo/Spam (English)
Send-AegisSMS "FLASH" "50% OFF EVERYTHING! Use code SPAM2026. Click to buy: http://cheap-deals.com"

# 6. Friendly (Ham)
Send-AegisSMS "Mom" "Hey honey, can you pick up some milk on your way home?"

Write-Host "`n--- MESSAGES SENT ---" -ForegroundColor Green
Write-Host "Check the 'Activity' tab in Aegis to see real-time categorization."
