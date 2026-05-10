import api from "./api";

export interface SemanticField {
  field: string;
  inferred_type: string;
  semantic_type: string;
  confidence: number;
  reasons: string[];
  source: "RULE" | "ML" | "HYBRID";
}

export interface InferenceMetrics {
  total_duration_ms: number;
  traversal_duration_ms: number;
  ml_calls_count: number;
  fallback_triggered: boolean;
}

export interface GenerationResponse {
  typescript: string;
  semantics: SemanticField[];
  was_repaired: boolean;
  metrics: InferenceMetrics;
}

export async function formatJson(input: string): Promise<string> {
  try {
    // baseURL already includes /api, so we use relative paths
    const response = await api.post("/format", { input });
    if (!response.data.success) {
      throw new Error(response.data.error || "Formatting failed");
    }
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || "Failed to format JSON");
  }
}

export async function repairJson(input: string): Promise<string> {
  try {
    // baseURL already includes /api, so we use relative paths
    const response = await api.post("/repair", { input });
    if (!response.data.success) {
      throw new Error(response.data.error || "Repair failed");
    }
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || "Failed to repair JSON");
  }
}

export async function generateTypes(input: string): Promise<GenerationResponse> {
  try {
    // baseURL already includes /api, so we use relative paths
    const response = await api.post("/generate-types", { input });
    if (!response.data.success) {
      throw new Error(response.data.error || "Type generation failed");
    }
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || "Failed to generate types");
  }
}
