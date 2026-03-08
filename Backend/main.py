from fastapi import FastAPI
from pydantic import BaseModel
import onnxruntime as ort
from transformers import AutoTokenizer
import numpy as np

app = FastAPI(title="SpamKiller Cloud AI Engine")

# Load the lightweight tokenizer (replace with your specific Roberta tokenizer path/name)
tokenizer = AutoTokenizer.from_pretrained("albert/albert-base-v2")

# Initialize the ONNX session (assuming you move roberta_spam_quant.onnx to the server root)
# NOTE: In production, load the model once during startup
ort_session = None
try:
    ort_session = ort.InferenceSession("roberta_spam_quant.onnx")
except:
    print("Warning: ONNX model not found. Place 'roberta_spam_quant.onnx' in the server root.")

class MessageRequest(BaseModel):
    text: string
    
class ClassificationResponse(BaseModel):
    isSpam: bool
    score: float

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

@app.post("/classify", response_model=ClassificationResponse)
async def classify_message(request: MessageRequest):
    if not ort_session:
        # Fallback if model is missing during local Dev/Test
        is_spam_fallback = "spam" in request.text.lower() or "win" in request.text.lower()
        return ClassificationResponse(isSpam=is_spam_fallback, score=0.99 if is_spam_fallback else 0.01)

    # 1. Tokenize the input text
    inputs = tokenizer(request.text, return_tokes=False, padding='max_length', truncation=True, max_length=128)
    
    # 2. Prepare inputs for ONNX format
    ort_inputs = {
        "input_ids": np.array([inputs['input_ids']], dtype=np.int64),
        "attention_mask": np.array([inputs['attention_mask']], dtype=np.int64),
    }

    # 3. Run Inference
    ort_outs = ort_session.run(None, ort_inputs)
    
    # The output is logits; we apply sigmoid for binary classification
    logits = ort_outs[0][0]
    spam_probability = float(sigmoid(logits[1])) # Assuming index 1 is SPAM 
    
    # 4. Return True if SPAM confidence > 80%
    return ClassificationResponse(
        isSpam=spam_probability > 0.80,
        score=spam_probability
    )

@app.get("/health")
async def health_check():
    return {"status": "ok", "model_loaded": ort_session is not None}
