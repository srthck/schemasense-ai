"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatJson = formatJson;
function formatJson(input) {
    try {
        const data = JSON.parse(input);
        return JSON.stringify(data, null, 2);
    }
    catch (error) {
        throw new Error("Invalid JSON provided for formatting.");
    }
}
