import { Request, Response } from "express";
import { formatJson } from "../services/formatService";
import { repairJson } from "../services/repairService";
import { generateTypes } from "../services/typeGenerationService";

export const format = (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (typeof input !== "string") {
      res.status(400).json({ success: false, error: "Input must be a string." });
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
    if (typeof input !== "string") {
      res.status(400).json({ success: false, error: "Input must be a string." });
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
    const data = await generateTypes(input);
    
    // Response remains structured: { typescript, semantics, was_repaired, metrics }
    res.json({ success: true, data });
  } catch (error: any) {
    // Step 4: Graceful error handling for irreparable JSON
    res.status(400).json({ 
      success: false, 
      error: error.message || "Type generation failed." 
    });
  }
};
