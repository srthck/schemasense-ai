import { SemanticField } from "../services/jsonService";

interface Props {
  semantics: SemanticField[];
  loading?: boolean;
}

/**
 * A professional developer-oriented panel for displaying semantic predictions
 * with confidence levels and explainability reasons.
 */
export default function SemanticPanel({ semantics, loading }: Props) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 rounded-lg border border-dashed border-slate-700 p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-semibold">Running hybrid inference...</p>
      </div>
    );
  }

  if (semantics.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-slate-900/20 rounded-lg border border-dashed border-slate-700 p-8 text-center">
        <p className="text-xs uppercase tracking-widest font-semibold">No semantic predictions available</p>
        <p className="text-[10px] mt-2 max-w-[200px] leading-relaxed">
          Analyze JSON to detect deep field semantics and explainability.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {semantics.map((item, idx) => (
        <div 
          key={`${item.field}-${idx}`}
          className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="overflow-hidden mr-2">
              <p className="text-[11px] font-mono text-indigo-400 truncate mb-1" title={item.field}>
                {item.field}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                  {item.inferred_type}
                </span>
                <span className="text-slate-700 text-[10px]">→</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
                  {item.semantic_type}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className={`text-[10px] font-mono font-bold ${
                item.confidence > 0.9 ? 'text-emerald-500' : 'text-yellow-500'
              }`}>
                {Math.round(item.confidence * 100)}%
              </span>
              <div className="w-10 h-0.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${
                    item.confidence > 0.9 ? 'bg-emerald-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${item.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-slate-800/50 space-y-1.5">
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Evidence</p>
            {item.reasons.map((reason, ridx) => (
              <div key={ridx} className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-1 h-1 bg-slate-700 rounded-full shrink-0" />
                <span className="font-mono text-[9px]">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
