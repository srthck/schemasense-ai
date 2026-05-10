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
        if (!input || typeof input !== "string") {
            res.status(400).json({ success: false, error: "Valid string input is required." });
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
        if (!input || typeof input !== "string") {
            res.status(400).json({ success: false, error: "Valid string input is required." });
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
        const { input } = req.body;
        if (!input || typeof input !== "string") {
            res.status(400).json({ success: false, error: "Valid string input is required." });
            return;
        }
        const data = yield (0, typeGenerationService_1.generateTypes)(input);
        // data is now { types: string, semantics: SemanticField[] }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message || "Type generation failed." });
    }
});
exports.generate = generate;
