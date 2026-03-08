# SpamKiller Cloud AI Engine

This is a lightweight Python FastAPI server designed to run the `roberta_spam_quant.onnx` model in the cloud. We built this because mobile operating systems (iOS and Android) strictly limit the memory of background processes, preventing the 100MB ONNX model from running natively on incoming SMS messages. 

By offloading the heavy AI inference to this fast Cloud API, the React Native App's background extensions can simply ping this server over HTTP in milliseconds to block spam silently.

## Installation

Ensure you have Python 3 installed.

```bash
# 1. Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install Dependencies
pip install -r requirements.txt

# 3. Add Model
# Ensure `roberta_spam_quant.onnx` is located in this directory.
```

## Running the Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

### POST `/classify`
Evaluates a text message using the Roberta Neural Engine.

**Request Body:**
```json
{
  "text": "Win free money now! Click here to claim your prize."
}
```

**Response:**
```json
{
  "isSpam": true,
  "score": 0.985
}
```

### GET `/health`
Checks if the server is running and the ONNX model is securely loaded into memory.
