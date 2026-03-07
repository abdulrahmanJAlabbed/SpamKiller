from transformers import pipeline

# This model is specifically fine-tuned for modern SMS/Social spam
model_id = "mshenoda/roberta-spam"

try:
    print(f"Loading {model_id}...")
    # Using the standard pipeline with your authenticated session
    pipe = pipeline("text-classification", model=model_id)
    
    # Copy and paste this list into your test_messages array
    test_messages = [
        # --- Turkish (Betting & Scams) ---
        "HERA BET'ten dev fırsat! 500 TL yatırımına 500 TL bonus. Hemen üye ol: herabetgiris.com",
        "Günün banko kuponu hazır! %100 kazanç garantili maçlar için tıkla: bit.ly/iddaa-canli",
        "Sn. Vatandas, adiniza acilmis icra takibi bulunmaktadir. Bilgi icin arayin: 0212XXXXXXX",
        "Aras Kargo: Paketiniz adres yetersizliği nedeniyle teslim edilememiştir. Güncelleyin: aras-takip-islem.com",
        "Tebrikler! Hediye çekiniz tanımlandı. Almak için onaylayın: hediye-merkezi.net",
        
        # --- Arabic (Betting & Prizes) ---
        "فرصة ذهبية! مكافأة 200% على أول إيداع لك في موقعنا العالمي. سجل الآن: bet-win-now.com",
        "مبروك! لقد ربحت جائزة نقدية بقيمة 10,000 ريال. تواصل معنا لاستلامها: wa.me/966XXXXXXXX",
        "تم تعليق بطاقتك البنكية. يرجى تحديث البيانات فوراً: bank-update-link.com",
        "وظائف شاغرة براتب 5000 دولار شهرياً. قدم الآن عبر الرابط التالي: jobs-portal-fake.com",
        
        # --- English (Modern Phishing & Betting) ---
        "URGENT: Your Netflix subscription has expired. Update your payment method: netflix-payment.co",
        "Final Reminder: Your PayPal account will be closed. Verify now: bit.ly/verify-pay-pal",
        "Get $200 FREE PLAY at LuckyVegas. Use code: JACKPOT. Join now: lucky-v.com",
        "Your USPS delivery is on hold. Please update your address to avoid return: usps-delivery-status.com"
    ]

    print("\n" + "="*30)
    print("   SPAM DETECTION RESULTS")
    print("="*30)
    
    for msg in test_messages:
        result = pipe(msg)
        label = result[0]['label'] # Likely 'LABEL_1' for spam, 'LABEL_0' for ham
        score = result[0]['score']
        
        # Mapping numerical labels to readable text
        status = "SPAM" if "1" in label else "HAM"
        
        print(f"Message: {msg}")
        print(f"→ Result: {status} (confidence: {score:.4f})\n")

except Exception as e:
    print(f"Error: {e}")