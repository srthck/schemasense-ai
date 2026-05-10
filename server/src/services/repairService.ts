/**
 * Advanced JSON repair engine designed to handle common developer errors:
 * - Trailing commas
 * - Single quotes
 * - Unquoted keys
 * - Accidental semicolons
 * - Mixed formatting
 */
export function repairJson(input: string): string {
  try {
    // Attempt standard parse first
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch (e) {
    let repaired = input;
    
    // 1. Convert accidental semicolons to commas (common in copy-paste)
    repaired = repaired.replace(/;\s*([}\]])/g, '$1'); // semicolon before closing
    repaired = repaired.replace(/;\s*"/g, ',"');       // semicolon before next key
    
    // 2. Safely remove trailing commas
    repaired = repaired.replace(/,(?=\s*[}\]])/g, '');
    
    // 3. Quote unquoted keys safely (support alphanumeric and underscores)
    // Avoid re-quoting already quoted keys or values
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, (match, p1, p2) => {
      // If p2 is already quoted, regex won't match [a-zA-Z0-9_]+ if it contains quotes
      return `${p1}"${p2}":`;
    });
    
    // 4. Replace single quotes with double quotes
    // This is tricky because we must avoid replacing nested single quotes inside double-quoted strings.
    // We use a safe-ish approach for common cases.
    repaired = repaired.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

    // 5. Fix broken arrays (missing commas between elements)
    // e.g. ["a" "b"] -> ["a", "b"]
    repaired = repaired.replace(/"\s+"/g, '","');
    repaired = repaired.replace(/}\s+{/g, '},{');

    try {
      const data = JSON.parse(repaired);
      return JSON.stringify(data, null, 2);
    } catch (error: any) {
      // If still failing, provide a human-readable error hint
      throw new Error("Could not repair JSON automatically. Please verify bracket balance and key formatting.");
    }
  }
}
