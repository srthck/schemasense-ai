"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonController_1 = require("../controllers/jsonController");
const router = (0, express_1.Router)();
router.post("/format", jsonController_1.format);
router.post("/repair", jsonController_1.repair);
router.post("/generate-types", jsonController_1.generate);
exports.default = router;
