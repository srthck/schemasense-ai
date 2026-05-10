import { Router } from "express";
import { format, repair, generate } from "../controllers/jsonController";

const router = Router();

router.post("/format", format);
router.post("/repair", repair);
router.post("/generate-types", generate);

export default router;
