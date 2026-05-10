import { Request, Response } from "express";
import { formatJson } from "../services/formatService";
import { repairJson } from "../services/repairService";
import { generateTypes } from "../services/typeGenerationService";

export const format = (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      res.status(400).json({ success: false, error: "Valid string input is required." });
      return;
    }
    const data = formatJson(input);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Formatting failed." });
  }
};

export const repair = (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      res.status(400).json({ success: false, error: "Valid string input is required." });
      return;
    }
    const data = repairJson(input);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Repair failed." });
  }
};

export const generate = async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      res.status(400).json({ success: false, error: "Valid string input is required." });
      return;
    }
    const data = await generateTypes(input);
    // data is now { types: string, semantics: SemanticField[] }
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Type generation failed." });
  }
};
