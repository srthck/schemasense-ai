export function formatJson(input: string): string {
  try {
    const data = JSON.parse(input);
    return JSON.stringify(data, null, 2);
  } catch (error: any) {
    throw new Error("Invalid JSON provided for formatting.");
  }
}
