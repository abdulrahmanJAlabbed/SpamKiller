# Aegis Stress Test & Bug Hunt
# Simulates multiple edge cases: non-standard characters, sneaky keywords, and silenced numbers.

function Send-AegisSMS {
    param([string]$Sender, [string]$Message)
    Write-Host "Simulating: [$Sender] $Message" -ForegroundColor Gray
    & "C:\Users\essor\AppData\Local\Android\Sdk\platform-tools\adb.exe" emu sms send $Sender $Message
}

Write-Host "--- AEGIS BUG HUNT INITIALIZING ---" -ForegroundColor Red

# 1. Sneaky Keyword Bypass (Case Sensitivity & Spacing)
Send-AegisSMS "SNEAKY" "h e y mom, I need help!"
Send-AegisSMS "SNEAKY" "HEY, you won a prize!"
Send-AegisSMS "SNEAKY" "hey... check this bank link: http://bit.ly"

# 2. Silenced Number Logic (Previously added numbers)
# Let's assume we'll add +123456789 to the silenced list manually or via script
Send-AegisSMS "+123456789" "This message should be blocked because the number is silenced."

# 3. Comma Parsing Edge Case (Commas in sender and body)
Send-AegisSMS "Bank, Support" "Your, account, is, locked."

# 4. Long Message (Truncation Check)
Send-AegisSMS "LongSender" ("A" * 150 + " SPAM KEYWORD " + "B" * 150)

# 5. Non-English (Arabic/Japanese mixed)
Send-AegisSMS "International" "مرحباً, check your account at account-fix.jp/login"

Write-Host "`n--- STRESS TEST DISPATCHED ---" -ForegroundColor Yellow
