"use client";

import React, { useState } from "react";
import { 
  Database, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  BookOpen,
  Link,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

interface KnowledgeBaseViewProps {
  onReindex: () => Promise<void>;
  isReindexing: boolean;
}

const POLICY_SECTIONS = [
  {
    title: "Return Policy",
    rules: [
      "Customers may return items within 30 days of the purchase date.",
      "Returned items must be unused and in original packaging with all accessories.",
      "Electronics (laptops, phones, tablets) must be returned within 15 days.",
      "Items marked 'Final Sale' cannot be returned or exchanged.",
      "Initiate return via support@techmart.com with order number.",
    ],
  },
  {
    title: "Refund Policy",
    rules: [
      "Refunds processed within 5 business days after returned item is received.",
      "Issued to the original payment method only.",
      "Shipping costs are non-refundable unless return is due to defective or wrong item.",
      "Credit card refunds may take an additional 3–5 business days to appear.",
    ],
  },
  {
    title: "Shipping Policy",
    rules: [
      "Standard shipping: 3–5 business days ($4.99).",
      "Express shipping: 1–2 business days ($12.99).",
      "Free standard shipping on orders above $50.",
      "Ships to all 50 US states (No international shipping).",
      "Orders placed before 2:00 PM EST dispatched same day.",
    ],
  },
  {
    title: "Warranty Policy",
    rules: [
      "1-year manufacturer warranty on all electronics for hardware defects.",
      "Does not cover physical damage, water damage, or unauthorized modifications.",
      "Claim warranty by contacting support@techmart.com with proof of purchase.",
      "Optional 2-year extended warranty available for laptops and desktops.",
    ],
  },
  {
    title: "Exchange Policy",
    rules: [
      "Allowed within 30 days of purchase (15 days for electronics).",
      "Item being exchanged must be in original condition.",
      "Customer pays difference if replacement costs more; refunded if replacement costs less.",
    ],
  },
  {
    title: "Customer Support",
    rules: [
      "Available Monday to Friday, 9:00 AM to 6:00 PM EST.",
      "Email: support@techmart.com | Phone: 1-800-TECHMART",
      "Live chat is available on the website during support hours.",
    ],
  },
];

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  onReindex,
  isReindexing,
}) => {
  const [reindexDone, setReindexDone] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetType, setSheetType] = useState<"orders" | "refunds" | "products">("refunds");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleReindexClick = async () => {
    await onReindex();
    setReindexDone(true);
    setTimeout(() => setReindexDone(false), 4000);
  };

  const handleSyncGoogleSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) return;

    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/sync-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheet_url: sheetUrl.trim(),
          sheet_type: sheetType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSyncStatus(`Success: ${data.message}`);
        setSheetUrl("");
      } else {
        setSyncStatus(`Error: ${data.detail || "Failed to sync Google Sheet"}`);
      }
    } catch (err: any) {
      setSyncStatus(`Connection error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111420] text-slate-200 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            <span>RAG Pipeline & Data Source Integration</span>
          </h2>
          <p className="text-xs text-slate-400">
            Powered by Gemini 3.5 Flash-Lite (Fast Response), ChromaDB Vector Search, and Google Sheets Live Sync
          </p>
        </div>

        <button
          onClick={handleReindexClick}
          disabled={isReindexing}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-md active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? "animate-spin" : ""}`} />
          <span>{isReindexing ? "Re-indexing ChromaDB..." : "Re-index Knowledge Base"}</span>
        </button>
      </div>

      {/* Google Sheets Sync Integration Box */}
      <div className="p-4 rounded-xl bg-[#161a28] border border-purple-500/30 shadow-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white">
              Connect Live Google Sheet (Refunds, Orders, or New Products)
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Ready for your Google Sheet
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Paste your Google Sheet share link or published CSV link. Mind_dream will automatically ingest rows, vectorize with gemini-embedding-2, and answer queries in real-time.
        </p>

        <form onSubmit={handleSyncGoogleSheet} className="flex flex-col sm:flex-row gap-2">
          <select
            value={sheetType}
            onChange={(e: any) => setSheetType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1e2436] border border-white/10 text-xs text-slate-200 outline-none focus:border-purple-500"
          >
            <option value="refunds">Refund Data (refunds.xlsx)</option>
            <option value="orders">New Orders Data (orders.xlsx)</option>
            <option value="products">Products Inventory (products.xlsx)</option>
          </select>

          <input
            type="text"
            placeholder="Paste Google Sheets link (e.g. https://docs.google.com/spreadsheets/d/...)"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#1e2436] border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            disabled={isSyncing || !sheetUrl.trim()}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isSyncing ? "Syncing..." : "Sync Sheet"}</span>
          </button>
        </form>

        {syncStatus && (
          <div className="mt-2.5 p-2 rounded-lg bg-black/30 border border-white/10 text-[11px] text-purple-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {reindexDone && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Vector store reindexed successfully with chunks from policy.txt and products.xlsx!</span>
        </div>
      )}

      {/* RAG Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-[#181d2c] border border-white/5">
          <span className="text-[11px] text-slate-400 block">Vector Database</span>
          <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> ChromaDB
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Persisted & Hybrid Searched</span>
        </div>
        <div className="p-3 rounded-xl bg-[#181d2c] border border-white/5">
          <span className="text-[11px] text-slate-400 block">Primary Model</span>
          <span className="text-sm font-bold text-emerald-300 mt-0.5 block truncate">
            Gemini 3.5 Flash-Lite
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Ultra Fast (~300ms)</span>
        </div>
        <div className="p-3 rounded-xl bg-[#181d2c] border border-white/5">
          <span className="text-[11px] text-slate-400 block">Embeddings Model</span>
          <span className="text-sm font-bold text-purple-300 mt-0.5 block truncate">
            gemini-embedding-2
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">3072 dimensions</span>
        </div>
        <div className="p-3 rounded-xl bg-[#181d2c] border border-white/5">
          <span className="text-[11px] text-slate-400 block">Performance Cache</span>
          <span className="text-sm font-bold text-amber-300 mt-0.5 block">
            Sub-5ms Memory LRU
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Zero Quota Usage for Repeat Queries</span>
        </div>
      </div>

      {/* Policy Sections Grid */}
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
        <BookOpen className="w-4 h-4 text-purple-400" />
        <span>Indexed Policy Document (policy.txt)</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {POLICY_SECTIONS.map((sec, i) => (
          <div key={i} className="p-3 rounded-xl bg-[#161a27] border border-white/10 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-xs text-purple-300 mb-2 pb-1.5 border-b border-white/5 flex items-center justify-between">
                <span>{sec.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">Section {i + 1}</span>
              </h4>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                {sec.rules.map((r, ri) => (
                  <li key={ri} className="leading-snug">{r}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
