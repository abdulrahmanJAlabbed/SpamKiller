import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType

model_onnx = onnx.load("roberta_spam.onnx")
quantize_dynamic("roberta_spam.onnx", "roberta_spam_quant.onnx", weight_type=QuantType.QInt8)
print("Quantized! Use roberta_spam_quant.onnx (~125MB smaller/faster).")