from transformers import pipeline
import re

model_id = "mshenoda/roberta-spam"
pipe = pipeline("text-classification", model=model_id)

# Simple rules to refine (e.g., coupons often have % / TL / discount words but no urgent/prize tone)
def refine_label(text, spam_score):
    text_lower = text.lower()
    # Coupon-like patterns (high chance false positive)
    coupon_keywords = ["tl", "bonus", "indirim", "%", "fırsat", "kod", "hediye", "çek", "kampanya"]
    is_likely_coupon = any(kw in text_lower for kw in coupon_keywords) and "üye ol" in text_lower or "kupon" in text_lower
    
    if spam_score > 0.98:  # very high confidence → almost always real spam
        if is_likely_coupon:
            return "COUPON (possible promo)", spam_score
        return "SPAM", spam_score
    elif spam_score > 0.90:
        return "LIKELY SPAM", spam_score
    else:
        return "HAM", spam_score

test_messages = [  # ← add your previous ones + some coupon-like to test
    "HERA BET'ten dev fırsat! 500 TL yatırımına 500 TL bonus. Hemen üye ol: herabetgiris.com",
    "50% indirim! Bugün sadece kullan kodu SAVE50: magaza.com",
    "Hey, akşam yemeğe gidiyor muyuz?",
    "Tebrikler! 10.000 TL kazandın. Tıkla: kazan.net",
]

print("\nIMPROVED RESULTS with threshold & rules")
for msg in test_messages:
    result = pipe(msg)[0]
    label_raw = result['label']
    score = result['score']
    refined_label, used_score = refine_label(msg, score)
    
    print(f"Message: {msg}")
    print(f"→ Raw: {'SPAM' if '1' in label_raw else 'HAM'} ({score:.4f})")
    print(f"→ Refined: {refined_label} ({used_score:.4f})\n")