import { describe, it, expect } from "vitest";
import { generateTypes } from "../src/services/typeGenerationService";

describe("Array Handling & Primitive Inference", () => {
  it("should handle arrays of objects and infer types correctly", async () => {
    const input = JSON.stringify({
      users: [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" }
      ]
    });
    
    const result = await generateTypes(input);
    expect(result.typescript).toContain("users: User[];");
    expect(result.typescript).toContain("interface User");
  });

  it("should handle arrays of primitives", async () => {
    const input = JSON.stringify({
      tags: ["typescript", "json", "ai"],
      scores: [10, 20, 30]
    });
    
    const result = await generateTypes(input);
    expect(result.typescript).toContain("tags:   string[];");
    expect(result.typescript).toContain("scores: number[];");
  });

  it("should handle nested arrays", async () => {
    const input = JSON.stringify({
      matrix: [[1, 2], [3, 4]]
    });
    
    const result = await generateTypes(input);
    expect(result.typescript).toContain("matrix: Array<number[]>;");
  });
});
