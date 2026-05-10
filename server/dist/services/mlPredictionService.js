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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictSemanticType = predictSemanticType;
const axios_1 = __importDefault(require("axios"));
// Requirement: Use environment variables, NOT hardcoded URLs.
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
/**
 * Communicates with the Python ML microservice to predict semantic type.
 * Implements a strict 200ms timeout for production fault tolerance.
 */
function predictSemanticType(key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`${ML_SERVICE_URL}/predict`, { key, value: String(value) }, { timeout: 200 } // Requirement: 200ms timeout
            );
            if (response.data && response.data.prediction) {
                return response.data;
            }
            return null;
        }
        catch (error) {
            // Requirement: Fail gracefully, errors do not crash the server.
            return null;
        }
    });
}
