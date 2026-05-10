"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonRoutes_1 = __importDefault(require("./routes/jsonRoutes"));
const app = (0, express_1.default)();
// Temporary acceptable configuration during deployment phase
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || "*"
}));
app.use(express_1.default.json());
app.use("/api", jsonRoutes_1.default);
app.get("/", (_req, res) => {
    res.json({
        message: "SchemaSense AI API Running",
    });
});
exports.default = app;
