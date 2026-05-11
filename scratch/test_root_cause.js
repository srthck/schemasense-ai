
function repairJson(input) {
    let repaired = input;
    repaired = repaired.replace(/;\s*([}\]])/g, "$1");
    repaired = repaired.replace(/;\s*"/g, ',"');
    repaired = repaired.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    repaired = repaired.replace(
      /(\"(?:[^\"\\]|\\.)*\"|\d+(?:\.\d+)?|true|false|null|[}\]])\s+([a-zA-Z0-9_]+)\s*:/g,
      '$1, "$2":'
    );
    repaired = repaired.replace(
      /(\"(?:[^\"\\]|\\.)*\"|\d+(?:\.\d+)?|true|false|null|[}\]])\s+(?=\"|[-\d\[\{]|true|false|null)/g,
      '$1,'
    );
    repaired = repaired.replace(/}\s*{/g, "},{");
    repaired = repaired.replace(/"\s+"/g, '","');
    repaired = repaired.replace(/,(?=\s*[}\]])/g, "");
    return repaired;
}

const input = `{
  "name": "John"
  "age": 22
}`;
console.log(repairJson(input));
try {
    JSON.parse(repairJson(input));
    console.log("SUCCESS");
} catch (e) {
    console.log("FAILURE", e.message);
}
