import { describe, it, expect } from "vitest";
import { generateTypes } from "../src/services/typeGenerationService";

describe("Semantic Inference Engine", () => {
  it("should detect emails correctly via regex rules", async () => {
    const input = JSON.stringify({
      user_email: "john.doe@example.com",
      backup_email: "backup@corp.co"
    });
    
    const result = await generateTypes(input);
    const emailSemantics = result.semantics.filter(s => s.semantic_type === "email");
    
    expect(emailSemantics).toHaveLength(2);
    expect(emailSemantics[0].source).toBe("RULE");
    expect(emailSemantics[0].confidence).toBeGreaterThan(0.9);
  });

  it("should detect UUIDs and ISO dates", async () => {
    const input = JSON.stringify({
      id: "550e8400-e29b-41d4-a716-446655440000",
      created_at: "2025-01-10T12:00:00Z"
    });
    
    const result = await generateTypes(input);
    const uuidSemantics = result.semantics.find(s => s.semantic_type === "uuid");
    const dateSemantics = result.semantics.find(s => s.semantic_type === "date_iso");
    
    expect(uuidSemantics).toBeDefined();
    expect(dateSemantics).toBeDefined();
  });

  it("should detect numeric IDs and booleans via heuristics", async () => {
    const input = JSON.stringify({
      user_id: "12345",
      is_active: "true"
    });
    
    const result = await generateTypes(input);
    const idSemantics = result.semantics.find(s => s.semantic_type === "numeric_id");
    const boolSemantics = result.semantics.find(s => s.semantic_type === "boolean");
    
    expect(idSemantics).toBeDefined();
    expect(boolSemantics).toBeDefined();
  });

  it("should detect URLs correctly", async () => {
    const input = JSON.stringify({
      website: "https://schemasense.ai",
      profile_link: "http://github.com/schemasense"
    });
    
    const result = await generateTypes(input);
    const urlSemantics = result.semantics.filter(s => s.semantic_type === "url");
    
    expect(urlSemantics).toHaveLength(2);
  });
});
