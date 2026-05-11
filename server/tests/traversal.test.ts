import { describe, it, expect } from "vitest";
import { generateTypes } from "../src/services/typeGenerationService";

describe("Recursive Traversal & Field Pathing", () => {
  it("should extract semantics from deep nested objects", async () => {
    const input = JSON.stringify({
      company: {
        employees: [
          {
            profile: {
              email: "john@example.com"
            }
          }
        ]
      }
    });
    
    const result = await generateTypes(input);
    const emailSemantics = result.semantics.find(s => s.field === "company.employees.profile.email");
    
    expect(emailSemantics).toBeDefined();
    expect(emailSemantics?.semantic_type).toBe("email");
  });

  it("should generate valid recursive TypeScript interfaces", async () => {
    const input = JSON.stringify({
      org: {
        departments: [
          {
            name: "Engineering",
            lead: {
              name: "Alice",
              contact: "alice@org.com"
            }
          }
        ]
      }
    });
    
    const result = await generateTypes(input);
    expect(result.typescript).toContain("interface Org");
    expect(result.typescript).toContain("interface Department");
    expect(result.typescript).toContain("interface Lead");
    expect(result.semantics.some(s => s.field === "org.departments.lead.contact")).toBe(true);
  });
});
