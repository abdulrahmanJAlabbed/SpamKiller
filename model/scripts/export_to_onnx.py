from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from pathlib import Path

model_id = "mshenoda/roberta-spam"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSequenceClassification.from_pretrained(model_id)

# Dummy input for export (ONNX needs this)
dummy_input = tokenizer("Test message", return_tensors="pt")

# Export
torch.onnx.export(model, 
                  (dummy_input['input_ids'], dummy_input['attention_mask']),
                  "roberta_spam.onnx",
                  input_names=['input_ids', 'attention_mask'],
                  output_names=['logits'],
                  dynamic_axes={'input_ids': {0: 'batch_size'}, 
                                'attention_mask': {0: 'batch_size'},
                                'logits': {0: 'batch_size'}})
print("Exported to roberta_spam.onnx!")
