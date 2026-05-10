import Editor from "@monaco-editor/react";
import { memo } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
};

const JsonEditor = memo(function JsonEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
}: Props) {
  return (
    <Editor
      height="500px"
      language={language}
      theme="vs-dark"
      value={value}
      onChange={(value) => onChange(value || "")}
      options={{
        readOnly,
        minimap: { enabled: false },
        automaticLayout: true,
        wordWrap: "on",
      }}
    />
  );
});

export default JsonEditor;
