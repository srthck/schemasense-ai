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
/**
 * Generates TypeScript interfaces and performs recursive semantic analysis using a
 * hybrid deterministic + ML pipeline.
 */
function generateTypes(input) {
    return __awaiter(this, void 0, void 0, function* () {
        let parsed;
        try {
            parsed = JSON.parse(input);
        }
        catch (e) {
            throw new Error("Input must be valid JSON to generate types.");
        }
        // Phase 6 / Step 9: Recursive JSON Traversal
        const semantics = [];
        yield analyzeRecursively(parsed, "", semantics);
        try {
            const jsonInput = (0, quicktype_core_1.jsonInputForTargetLanguage)("typescript");
            yield jsonInput.addSource({
                name: "Root",
                samples: [input],
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
            return {
                typescript: quicktypeValue.lines.join("\n"),
                semantics
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
function analyzeRecursively(obj, path, results) {
    return __awaiter(this, void 0, void 0, function* () {
        if (obj === null || typeof obj !== "object")
            return;
        // Handle arrays by analyzing the first element if it's an object, or skip if primitive
        if (Array.isArray(obj)) {
            if (obj.length > 0 && typeof obj[0] === "object") {
                yield analyzeRecursively(obj[0], path, results);
            }
            return;
        }
        for (const key in obj) {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            const inferredType = typeof value;
            if (value !== null && typeof value === "object") {
                yield analyzeRecursively(value, currentPath, results);
            }
            else {
                // Phase 6 / Step 8: Deterministic First Architecture
                const semanticInfo = yield runInferencePipeline(key, value);
                if (semanticInfo && semanticInfo.semantic_type !== "unknown") {
                    results.push(Object.assign({ field: currentPath, inferred_type: inferredType }, semanticInfo));
                }
            }
        }
    });
}
/**
 * Hybrid inference pipeline: Regex -> Heuristics -> ML Fallback.
 */
function runInferencePipeline(key, value) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const mlResult = yield (0, mlPredictionService_1.predictSemanticType)(key, value);
        if (mlResult) {
            return {
                semantic_type: mlResult.prediction,
                confidence: mlResult.confidence,
                reasons: mlResult.reasons
            };
        }
        return null;
    });
}
