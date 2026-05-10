import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from feature_extractor import extract_features, get_feature_names

app = FastAPI(title="SchemaSense ML Service")

# Load model artifacts once on startup
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
try:
    model = joblib.load(os.path.join(MODELS_DIR, "semantic_v1.pkl"))
    le = joblib.load(os.path.join(MODELS_DIR, "label_encoder.pkl"))
    scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
    feature_names = get_feature_names()
except Exception as e:
    print(f"Error loading ML artifacts: {e}")
    model = le = scaler = None

class PredictRequest(BaseModel):
    key: str
    value: str

class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    reasons: List[str]

@app.get("/health")
async def health():
    if model is None:
        return {"status": "unhealthy", "error": "Model artifacts not loaded"}
    return {"status": "healthy"}

@app.post("/predict")
async def predict(request: PredictRequest):
    if model is None:
        return {"success": False, "error": "ML Service unavailable (artifacts not loaded)"}

    try:
        # Extract features (must be numeric vector)
        features = extract_features(request.key, request.value)
        X = np.array([features])
        
        # Scale
        X_scaled = scaler.transform(X)
        
        # Inference with probabilities
        probs = model.predict_proba(X_scaled)[0]
        max_idx = np.argmax(probs)
        prediction = le.classes_[max_idx]
        confidence = float(probs[max_idx])

        # Generate deterministic reasons based on feature extraction results
        # Feature mapping from feature_extractor.py:
        # 0: contains_email, 1: contains_id, 2: contains_date, 3: contains_url, 4: contains_uuid
        # 11: is_number, 12: is_boolean, 16: regex_email_match, 17: regex_uuid_match, 18: regex_date_match, 19: regex_url_match
        reasons = []
        if features[16] == 1.0: reasons.append("regex_email_match")
        if features[17] == 1.0: reasons.append("regex_uuid_match")
        if features[18] == 1.0: reasons.append("regex_date_match")
        if features[19] == 1.0: reasons.append("regex_url_match")
        if features[0] == 1.0: reasons.append("contains_email")
        if features[1] == 1.0: reasons.append("contains_id")
        if features[2] == 1.0: reasons.append("contains_date")
        if features[3] == 1.0: reasons.append("contains_url")
        if features[11] == 1.0: reasons.append("value_is_numeric")
        if features[12] == 1.0: reasons.append("value_is_boolean")
        
        if not reasons:
            reasons.append("statistical_pattern_match")

        return {
            "prediction": str(prediction),
            "confidence": round(confidence, 4),
            "reasons": reasons
        }
    except Exception as e:
        return {"success": False, "error": f"Inference failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
