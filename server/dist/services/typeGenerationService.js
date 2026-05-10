"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTypes = generateTypes;
const quicktype_core_1 = require("quicktype-core");
const mlPredictionService_1 = require("./mlPredictionService");
const repairService_1 = require("./repairService");
const perf_hooks_1 = require("perf_hooks");
/**
 * Generates TypeScript interfaces and performs recursive semantic analysis using a
 * hybrid deterministic + ML pipeline with performance instrumentation.
 * Implements a repair-first architecture to handle malformed input JSON.
 */
function generateTypes(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTotal = perf_hooks_1.performance.now();
        let parsed;
        let repairedInput = input;
        // Step 2: Repair-first parsing pipeline
        try {
            parsed = JSON.parse(input);
        }
        catch (_a) {
            try {
                repairedInput = (0, repairService_1.repairJson)(input);
                parsed = JSON.parse(repairedInput);
            }
            catch (_b) {
                throw new Error("Unable to repair malformed JSON.");
            }
        }
        const semantics = [];
        const metricsState = { ml_calls: 0, fallback: false };
        const startTraversal = perf_hooks_1.performance.now();
        yield analyzeRecursively(parsed, "", semantics, metricsState);
        const endTraversal = perf_hooks_1.performance.now();
        try {
            const jsonInput = (0, quicktype_core_1.jsonInputForTargetLanguage)("typescript");
            yield jsonInput.addSource({
                name: "Root",
                samples: [repairedInput], // Use repaired input for quicktype generation
            });
            const inputData = new quicktype_core_1.InputData();
            inputData.addInput(jsonInput);
            const quicktypeValue = yield (0, quicktype_core_1.quicktype)({
                inputData,
                lang: "typescript",
                rendererOptions: {
                    "just-types": "true",
                },
            });
            const endTotal = perf_hooks_1.performance.now();
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
        }
        catch (error) {
            throw new Error("An error occurred during type generation.");
        }
    });
}
/**
 * Traverses JSON tree to identify semantic meaning of leaf nodes.
 */
function analyzeRecursively(obj, path, results, state) {
    return __awaiter(this, void 0, void 0, function* () {
        if (obj === null || typeof obj !== "object")
            return;
        if (Array.isArray(obj)) {
            if (obj.length > 0 && typeof obj[0] === "object") {
                yield analyzeRecursively(obj[0], path, results, state);
            }
            return;
        }
        for (const key in obj) {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            const inferredType = typeof value;
            if (value !== null && typeof value === "object") {
                yield analyzeRecursively(value, currentPath, results, state);
            }
            else {
                const semanticInfo = yield runInferencePipeline(key, value, state);
                if (semanticInfo && semanticInfo.semantic_type !== "unknown") {
                    results.push(Object.assign({ field: currentPath, inferred_type: inferredType }, semanticInfo));
                }
            }
        }
    });
}
/**
 * Hybrid inference pipeline: Regex -> Heuristics -> ML Fallback.
 * Optimized for production precision and source transparency.
 */
function runInferencePipeline(key, value, state) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const mlResult = yield (0, mlPredictionService_1.predictSemanticType)(key, value);
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
    });
}
