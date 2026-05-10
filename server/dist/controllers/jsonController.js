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
exports.generate = exports.repair = exports.format = void 0;
const formatService_1 = require("../services/formatService");
const repairService_1 = require("../services/repairService");
const typeGenerationService_1 = require("../services/typeGenerationService");
const format = (req, res) => {
    try {
        const { input } = req.body;
        if (typeof input !== "string") {
            res.status(400).json({ success: false, error: "Input must be a string." });
            return;
        }
        const data = (0, formatService_1.formatJson)(input);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message || "Formatting failed." });
    }
};
exports.format = format;
const repair = (req, res) => {
    try {
        const { input } = req.body;
        if (typeof input !== "string") {
            res.status(400).json({ success: false, error: "Input must be a string." });
            return;
        }
        const data = (0, repairService_1.repairJson)(input);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message || "Repair failed." });
    }
};
exports.repair = repair;
const generate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Contract Check: Support both 'input' and 'json' for high resilience during migration
        const input = req.body.input || req.body.json;
        if (input === undefined || typeof input !== "string") {
            res.status(400).json({
                success: false,
                error: "Valid string input is required in 'input' field."
            });
            return;
        }
        // Step 3: Malformed JSON repair happens INSIDE generateTypes pipeline
        // before semantic analysis or quicktype generation.
        const data = yield (0, typeGenerationService_1.generateTypes)(input);
        // Response remains structured: { typescript, semantics, was_repaired, metrics }
        res.json({ success: true, data });
    }
    catch (error) {
        // Step 4: Graceful error handling for irreparable JSON
        res.status(400).json({
            success: false,
            error: error.message || "Type generation failed."
        });
    }
});
exports.generate = generate;
