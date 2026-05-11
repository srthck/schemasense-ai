import { describe, it, expect } from "vitest";
import { repairJson } from "../src/services/repairService";

describe("Malformed JSON Repair Pipeline", () => {
  it("should repair unquoted keys and missing commas", () => {
    const malformed = `{
      name: "John"
      age: 22,
    }`;
    const repaired = repairJson(malformed);
    const parsed = JSON.parse(repaired);
    
    expect(parsed).toEqual({
      name: "John",
      age: 22
    });
  });

  it("should handle trailing commas in objects", () => {
    const malformed = `{
      "name": "John",
    }`;
    const repaired = repairJson(malformed);
    const parsed = JSON.parse(repaired);
    
    expect(parsed).toEqual({
      name: "John"
    });
  });

  it("should handle nested malformed objects", () => {
    const malformed = `{
      users: [
        { id: 1 name: "John" }
        { id: 2 name: "Jane" }
      ]
    }`;
    const repaired = repairJson(malformed);
    const parsed = JSON.parse(repaired);
    
    expect(parsed.users).toHaveLength(2);
    expect(parsed.users[0]).toEqual({ id: 1, name: "John" });
    expect(parsed.users[1]).toEqual({ id: 2, name: "Jane" });
  });

  it("should handle mixed malformed arrays and objects", () => {
    const malformed = `[
      { id: 1 active: true }
      { id: 2 active: false }
    ]`;
    const repaired = repairJson(malformed);
    const parsed = JSON.parse(repaired);
    
    expect(parsed).toHaveLength(2);
    expect(parsed[0].active).toBe(true);
    expect(parsed[1].active).toBe(false);
  });
});
