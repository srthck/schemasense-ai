import axios from "axios";

const ML_SERVICE_URL = "http://127.0.0.1:8000";

export type PredictionResult = {
  prediction: string;
  confidence: number;
  reasons: string[];
};

/**
 * Communicates with the Python ML microservice to predict semantic type.
 * Implements a strict 200ms timeout for production fault tolerance.
 */
export async function predictSemanticType(key: string, value: any): Promise<PredictionResult | null> {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      { key, value: String(value) },
      { timeout: 200 } // Requirement: 200ms timeout
    );

    if (response.data && response.data.prediction) {
      return response.data as PredictionResult;
    }
    return null;
  } catch (error) {
    // Fail gracefully: if service is down or times out, return null to fallback
    return null;
  }
}
