export function repairJson(input: string): string {
  try {
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch (e) {
    let repaired = input;
    
    // Safely remove trailing commas
    repaired = repaired.replace(/,(?=\s*[}\]])/g, '');
    
    // Quote unquoted keys safely
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    
    // Replace single quotes mapping to double quotes for strings
    repaired = repaired.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

    try {
      const data = JSON.parse(repaired);
      return JSON.stringify(data, null, 2);
    } catch (error: any) {
      throw new Error("Could not repair JSON automatically. Please check for syntax errors.");
    }
  }
}
