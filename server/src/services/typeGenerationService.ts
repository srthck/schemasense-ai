import { InputData, jsonInputForTargetLanguage, quicktype } from "quicktype-core";
import { predictSemanticType } from "./mlPredictionService";
import { repairJson } from "./repairService";
import { performance } from "perf_hooks";

export type InferenceSource = "RULE" | "ML" | "HYBRID";

export type SemanticMetadata = {
  field: string;
  inferred_type: string;
  semantic_type: string;
  confidence: number;
  reasons: string[];
  source: InferenceSource;
};

export type InferenceMetrics = {
  total_duration_ms: number;
  traversal_duration_ms: number;
  ml_calls_count: number;
  fallback_triggered: boolean;
};

export type GenerationResult = {
  typescript: string;
  semantics: SemanticMetadata[];
  was_repaired: boolean;
  metrics: InferenceMetrics;
};

/**
 * Generates TypeScript interfaces and performs recursive semantic analysis using a
 * hybrid deterministic + ML pipeline with performance instrumentation.
 * Implements a repair-first architecture to handle malformed input JSON.
 */
export async function generateTypes(input: string): Promise<GenerationResult> {
  const startTotal = performance.now();
  let parsed: any;
  let repairedInput = input;

  // Step 2: Repair-first parsing pipeline
  try {
    parsed = JSON.parse(input);
  } catch {
    try {
      repairedInput = repairJson(input);
      parsed = JSON.parse(repairedInput);
    } catch {
      throw new Error("Unable to repair malformed JSON.");
    }
  }

  const semantics: SemanticMetadata[] = [];
  const metricsState = { ml_calls: 0, fallback: false };

  const startTraversal = performance.now();
  await analyzeRecursively(parsed, "", semantics, metricsState);
  const endTraversal = performance.now();

  try {
    const jsonInput = jsonInputForTargetLanguage("typescript");
    await jsonInput.addSource({
      name: "Root",
      samples: [repairedInput], // Use repaired input for quicktype generation
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const quicktypeValue = await quicktype({
      inputData,
      lang: "typescript",
      rendererOptions: {
        "just-types": "true",
      },
    });

    const endTotal = performance.now();

    return {
      typescript: quicktypeValue.lines.join("\n"),
      semantics,
      was_repaired: repairedInput !== input,
      metrics: {
        total_duration_ms: Math.round(endTotal - startTotal),
        traversal_duration_ms: Math.round(endTraversal - startTraversal),
        ml_calls_count: metricsState.ml_calls,
        fallback_triggered: metricsState.fallback,
      }
    };
  } catch (error: any) {
    throw new Error("An error occurred during type generation.");
  }
}

/**
 * Traverses JSON tree to identify semantic meaning of leaf nodes.
 */
async function analyzeRecursively(obj: any, path: string, results: SemanticMetadata[], state: { ml_calls: number, fallback: boolean }) {
  if (obj === null || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === "object") {
      await analyzeRecursively(obj[0], path, results, state);
    }
    return;
  }

  for (const key in obj) {
    const value = obj[key];
    const currentPath = path ? `${path}.${key}` : key;
    const inferredType = typeof value;

    if (value !== null && typeof value === "object") {
      await analyzeRecursively(value, currentPath, results, state);
    } else {
      const semanticInfo = await runInferencePipeline(key, value, state);
      if (semanticInfo && semanticInfo.semantic_type !== "unknown") {
        results.push({
          field: currentPath,
          inferred_type: inferredType,
          ...semanticInfo
        });
      }
    }
  }
}

/**
 * Hybrid inference pipeline: Regex -> Heuristics -> ML Fallback.
 * Optimized for production precision and source transparency.
 */
async function runInferencePipeline(key: string, value: any, state: { ml_calls: number, fallback: boolean }): Promise<{ semantic_type: string, confidence: number, reasons: string[], source: InferenceSource } | null> {
  const valStr = String(value);
  const keyLower = key.toLowerCase();

  // 1. Strict Regex matches (RULE)
  // Email
  if (/^[\w\.\+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/.test(valStr)) {
    return { semantic_type: "email", confidence: 0.99, reasons: ["regex_email_match"], source: "RULE" };
  }
  // UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valStr)) {
    return { semantic_type: "uuid", confidence: 0.99, reasons: ["regex_uuid_match"], source: "RULE" };
  }
  // ISO Date
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(valStr)) {
    return { semantic_type: "date_iso", confidence: 0.98, reasons: ["regex_date_match"], source: "RULE" };
  }
  // URL
  if (/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(valStr)) {
    return { semantic_type: "url", confidence: 0.95, reasons: ["regex_url_match"], source: "RULE" };
  }

  // 2. Deterministic Heuristics (RULE)
  // Boolean
  if (typeof value === "boolean" || valStr.toLowerCase() === "true" || valStr.toLowerCase() === "false") {
    return { semantic_type: "boolean", confidence: 0.99, reasons: ["deterministic_boolean_check"], source: "RULE" };
  }
  // Suffix/Prefix Date Heuristics
  if (keyLower.endsWith("at") || keyLower.includes("date") || keyLower.includes("time")) {
    if (!isNaN(Date.parse(valStr))) {
      return { semantic_type: "date_iso", confidence: 0.92, reasons: ["date_keyword_suffix_match"], source: "RULE" };
    }
  }
  // Suffix/Prefix URL Heuristics
  if (keyLower.endsWith("url") || keyLower.endsWith("link") || keyLower.endsWith("website")) {
    if (valStr.startsWith("http")) {
      return { semantic_type: "url", confidence: 0.94, reasons: ["url_keyword_suffix_match"], source: "RULE" };
    }
  }
  // Numeric ID
  if ((keyLower.endsWith("id") || keyLower.startsWith("id_")) && /^\d+$/.test(valStr)) {
    return { semantic_type: "numeric_id", confidence: 0.90, reasons: ["numeric_id_suffix_match"], source: "RULE" };
  }

  // 3. ML Fallback (HYBRID/ML)
  state.ml_calls++;
  const mlResult = await predictSemanticType(key, value);
  if (mlResult) {
    // If ML finds something but it's ambiguous, label as HYBRID if we had some rule hints, or ML if pure
    const hasRuleHints = keyLower.includes("email") || keyLower.includes("id") || keyLower.includes("date");
    return {
      semantic_type: mlResult.prediction,
      confidence: mlResult.confidence,
      reasons: mlResult.reasons,
      source: hasRuleHints ? "HYBRID" : "ML"
    };
  }

  state.fallback = true;
  return null;
}
