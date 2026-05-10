import { useEffect, useState, useCallback } from "react";
import JsonEditor from "./components/JsonEditor";
import SemanticPanel from "./components/SemanticPanel";
import { formatJson, repairJson, generateTypes } from "./services/jsonService";
import type { SemanticField, InferenceMetrics } from "./services/jsonService";
import api from "./services/api";
import Toast, { type ToastType } from "./components/Toast";
import { Loader2, Copy, Play, Wrench, Code2, BrainCircuit, Activity, Zap, Timer, Server, AlertCircle } from "lucide-react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [semantics, setSemantics] = useState<SemanticField[]>([]);
  const [metrics, setMetrics] = useState<InferenceMetrics | null>(null);
  const [wasRepaired, setWasRepaired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [outputLanguage, setOutputLanguage] = useState("typescript");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    api.get("/").catch(() => { }); // silent ping
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const handleFormat = async () => {
    if (!input.trim()) {
      showToast("Please provide input JSON", "info");
      return;
    }
    setLoading(true);
    setActiveAction("format");
    try {
      const formatted = await formatJson(input);
      setOutput(formatted);
      setOutputLanguage("json");
      showToast("JSON formatted successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleRepair = async () => {
    if (!input.trim()) {
      showToast("Please provide input JSON", "info");
      return;
    }
    setLoading(true);
    setActiveAction("repair");
    try {
      const repaired = await repairJson(input);
      setOutput(repaired);
      setOutputLanguage("json");
      showToast("JSON repaired successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleExportTs = async () => {
    if (!input.trim()) {
      showToast("Please provide input JSON", "info");
      return;
    }
    setLoading(true);
    setAnalyzing(true);
    setActiveAction("exportTs");
    try {
      const result = await generateTypes(input);
      setOutput(result.typescript);
      setSemantics(result.semantics);
      setMetrics(result.metrics);
      setWasRepaired(result.was_repaired);
      setOutputLanguage("typescript");
      if (result.was_repaired) {
        showToast("JSON repaired & Types generated", "warning");
      } else {
        showToast("Types & Semantics generated", "success");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
      setAnalyzing(false);
      setActiveAction(null);
    }
  };

  const handleCopyOutput = async () => {
    if (!output) {
      showToast("Nothing to copy", "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      showToast("Copied to clipboard", "success");
    } catch (err) {
      showToast("Failed to copy", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-indigo-500 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            SchemaSense AI
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Backend: Online
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            ML Engine: Active
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 flex-1 flex flex-col gap-6 min-h-0">
        {/* Main Layout Container */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

          {/* Left Column: Editors */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleFormat}
                  disabled={loading}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider">
                  {activeAction === "format" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Format
                </button>

                <button
                  onClick={handleRepair}
                  disabled={loading}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider">
                  {activeAction === "repair" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                  Repair
                </button>

                <button
                  onClick={handleExportTs}
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20">
                  {activeAction === "exportTs" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Code2 className="w-3.5 h-3.5" />}
                  Analyze & Export
                </button>
              </div>

              <div className="flex items-center gap-4">
                {metrics && (
                  <div className="hidden sm:flex items-center gap-4 pr-4 border-r border-slate-700">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Timer className="w-2 h-2" /> Latency
                      </span>
                      <span className="text-[11px] font-mono text-indigo-400 font-bold">{metrics.total_duration_ms}ms</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Server className="w-2 h-2" /> ML Calls
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">{metrics.ml_calls_count}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleCopyOutput}
                  disabled={!output || loading}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
            </div>

            {/* Editors Stack */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              {/* Input Panel */}
              <div className="flex-1 flex flex-col bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm min-h-[250px]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Input JSON</h2>
                  {wasRepaired && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-tight">Auto-Repaired</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-900/50">
                  <JsonEditor value={input} onChange={setInput} language="json" />
                </div>
              </div>

              {/* Output Panel */}
              <div className="flex-1 flex flex-col bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm min-h-[250px]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Output</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${outputLanguage === "typescript"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                      {outputLanguage === "typescript" ? "TS" : "JSON"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-900/50">
                  <JsonEditor value={output} onChange={setOutput} language={outputLanguage} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Semantic Analysis Sidebar */}
          <div className="lg:w-80 flex flex-col bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm shrink-0 min-h-[400px] lg:min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0 pb-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Semantic Analysis</h2>
              </div>
              {semantics.length > 0 && (
                <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {semantics.length} fields
                </span>
              )}
            </div>
            <SemanticPanel semantics={semantics} loading={analyzing} />
            
            {metrics && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Zap className="w-2 h-2 text-yellow-500" /> Traversal
                  </span>
                  <span className="text-xs font-mono text-slate-300">{metrics.traversal_duration_ms}ms</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <BrainCircuit className="w-2 h-2 text-indigo-500" /> Mode
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {metrics.fallback_triggered ? "Fallback" : "Standard"}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
