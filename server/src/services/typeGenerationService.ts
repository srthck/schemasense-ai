import { InputData, jsonInputForTargetLanguage, quicktype } from "quicktype-core";
import { predictSemanticType } from "./mlPredictionService";

export type SemanticMetadata = {
  field: string;
  inferred_type: string;
  semantic_type: string;
  confidence: number;
  reasons: string[];
};

export type GenerationResult = {
  typescript: string;
  semantics: SemanticMetadata[];
};

/**
 * Generates TypeScript interfaces and performs recursive semantic analysis using a
 * hybrid deterministic + ML pipeline.
 */
export async function generateTypes(input: string): Promise<GenerationResult> {
  let parsed: any;
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    throw new Error("Input must be valid JSON to generate types.");
  }

  // Phase 6 / Step 9: Recursive JSON Traversal
  const semantics: SemanticMetadata[] = [];
  await analyzeRecursively(parsed, "", semantics);

  try {
    const jsonInput = jsonInputForTargetLanguage("typescript");
    await jsonInput.addSource({
      name: "Root",
      samples: [input],
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

    return {
      typescript: quicktypeValue.lines.join("\n"),
      semantics
    };
  } catch (error: any) {
    throw new Error("An error occurred during type generation.");
  }
}

/**
 * Traverses JSON tree to identify semantic meaning of leaf nodes.
 */
async function analyzeRecursively(obj: any, path: string, results: SemanticMetadata[]) {
  if (obj === null || typeof obj !== "object") return;

  // Handle arrays by analyzing the first element if it's an object, or skip if primitive
  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === "object") {
      await analyzeRecursively(obj[0], path, results);
    }
    return;
  }

  for (const key in obj) {
    const value = obj[key];
    const currentPath = path ? `${path}.${key}` : key;
    const inferredType = typeof value;

    if (value !== null && typeof value === "object") {
      await analyzeRecursively(value, currentPath, results);
    } else {
      // Phase 6 / Step 8: Deterministic First Architecture
      const semanticInfo = await runInferencePipeline(key, value);
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
 */
async function runInferencePipeline(key: string, value: any): Promise<{ semantic_type: string, confidence: number, reasons: string[] } | null> {
  const valStr = String(value);

  // 1. Strict Regex matches (High confidence)
  if (/^[\w\.\+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/.test(valStr)) {
    return { semantic_type: "email", confidence: 1.0, reasons: ["regex_email_match"] };
  }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valStr)) {
    return { semantic_type: "uuid", confidence: 1.0, reasons: ["regex_uuid_match"] };
  }

  // 2. Deterministic Heuristics
  if (typeof value === "boolean" || valStr.toLowerCase() === "true" || valStr.toLowerCase() === "false") {
    return { semantic_type: "boolean", confidence: 1.0, reasons: ["deterministic_boolean_check"] };
  }

  // 3. ML Fallback for ambiguous fields
  const mlResult = await predictSemanticType(key, value);
  if (mlResult) {
    return {
      semantic_type: mlResult.prediction,
      confidence: mlResult.confidence,
      reasons: mlResult.reasons
    };
  }

  return null;
}
