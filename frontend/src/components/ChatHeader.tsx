"use client";

import React from "react";
import { RotateCcw, Minimize2, Maximize2, Database, Sparkles } from "lucide-react";

interface ChatHeaderProps {
  onRestart: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenKnowledge: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onRestart,
  isExpanded,
  onToggleExpand,
  onOpenKnowledge,
}) => {
  return (
    <header className="px-4 py-2.5 bg-[#161a26]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mind_Dream Agent Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-[1.5px] shadow-lg shadow-purple-900/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#111420] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#161a26] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-100 text-base leading-tight tracking-wide">
              Mind_Dream
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              AI Sales & Orders
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Online</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Takes Orders & Processes Refunds</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenKnowledge}
          title="Inspect RAG Knowledge & ChromaDB"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-xs flex items-center gap-1 border border-transparent hover:border-white/10"
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline text-xs text-purple-300">RAG Info</span>
        </button>

        <button
          onClick={onRestart}
          title="Restart Chat"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all active:scale-95"
          aria-label="Restart Chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all active:scale-95"
          aria-label="Toggle Expand"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-xs font-semibold text-white ml-1 border border-white/20">
          U
        </div>
      </div>
    </header>
  );
};
