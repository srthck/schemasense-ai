/**
 * Advanced JSON repair engine designed to handle common developer errors:
 * - Trailing commas
 * - Single quotes
 * - Unquoted keys
 * - Missing commas
 * - Accidental semicolons
 * - Mixed formatting
 */

export function repairJson(input: string): string {
  try {
    // Fast path: already valid JSON
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch {
    let repaired = input;

    // ---------------------------------------------------
    // 1. Remove accidental semicolons
    // ---------------------------------------------------

    repaired = repaired.replace(/;\s*([}\]])/g, "$1");
    repaired = repaired.replace(/;\s*"/g, ',"');

    // ---------------------------------------------------
    // 2. Replace single quotes with double quotes
    // ---------------------------------------------------

    repaired = repaired.replace(
      /'([^'\\]*(?:\\.[^'\\]*)*)'/g,
      '"$1"'
    );

    // ---------------------------------------------------
    // 3. Insert missing commas between properties
    // Handles:
    // "John" age:
    // 22 next:
    // true next:
    // } next:
    // ] next:
    // ---------------------------------------------------
    repaired = repaired.replace(
      /(".*?"|\d+|true|false|null|\}|\])\s*("?[a-zA-Z0-9_]+"?\s*:)/g,
      '$1, $2'
    );

    // ---------------------------------------------------
    // 4. Quote unquoted keys
    // ---------------------------------------------------
    repaired = repaired.replace(
      /([{,]\s*)([a-zA-Z0-9_]+)\s*:/g,
      '$1"$2":'
    );

    // ---------------------------------------------------
    // 5. Fix missing commas between objects
    // Example:
    // } {
    // =>
    // },{
    // ---------------------------------------------------

    repaired = repaired.replace(/}\s*{/g, "},{");

    // ---------------------------------------------------
    // 6. Fix missing commas between string array items
    // ---------------------------------------------------

    repaired = repaired.replace(/"\s+"/g, '","');

    // ---------------------------------------------------
    // 7. Remove trailing commas safely
    // ---------------------------------------------------

    repaired = repaired.replace(/,(?=\s*[}\]])/g, "");

    // ---------------------------------------------------
    // Final validation
    // ---------------------------------------------------

    try {
      const parsed = JSON.parse(repaired);
      return JSON.stringify(parsed, null, 2);
    } catch {
      throw new Error(
        "Could not repair JSON automatically. Please verify bracket balance and key formatting."
      );
    }
  }
}
