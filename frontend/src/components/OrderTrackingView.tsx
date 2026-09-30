"use client";

import React from "react";
import { Package, Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, Building2, CreditCard } from "lucide-react";

interface OrderTrackingViewProps {
  onAskAgent: (query: string) => void;
}

const LIVE_GOOGLE_SHEET_ORDERS = [
  {
    orderId: "ORD-101",
    customer: "Ali",
    product: "Laptop",
    category: "Electronics",
    daysAgo: "40 days ago",
    status: "Standard / No request",
    eligible: false,
    reason: "Exceeded 15-day electronics window (40 days)",
    prompt: "Can customer Ali return order ORD-101 (laptop) purchased 40 days ago?",
  },
  {
    orderId: "ORD-102",
    customer: "Sara",
    product: "Headphones",
    category: "Electronics",
    daysAgo: "18 days ago",
    status: "Standard / No request",
    eligible: false,
    reason: "Exceeded 15-day electronics window (18 days)",
    prompt: "Can Sara return her order ORD-102 (headphones) purchased 18 days ago?",
  },
  {
    orderId: "ORD-103",
    customer: "John",
    product: "Phone",
    category: "Electronics",
    daysAgo: "3 days ago",
    status: "Return Approved",
    eligible: true,
    bankInfo: "Meezan Bank (Acc: 9876543210)",
    reason: "Approved within 15 days window (3 days)",
    prompt: "What is the refund status and designated bank details for John's order ORD-103?",
  },
  {
    orderId: "ORD-104",
    customer: "Mia",
    product: "Tablet",
    category: "Electronics",
    daysAgo: "22 days ago",
    status: "Standard / No request",
    eligible: false,
    reason: "Exceeded 15-day electronics window (22 days)",
    prompt: "Can Mia return order ORD-104 (tablet) purchased 22 days ago?",
  },
  {
    orderId: "ORD-105",
    customer: "Abis",
    product: "Headphones",
    category: "Electronics",
    daysAgo: "18 days ago",
    status: "Standard / No request",
    eligible: false,
    reason: "Exceeded 15-day electronics window (18 days)",
    prompt: "Can Abis return order ORD-105 (headphones) purchased 18 days ago?",
  },
  {
    orderId: "ORD-106",
    customer: "Syed",
    product: "Phone",
    category: "Electronics",
    daysAgo: "7 days ago",
    status: "Return Approved",
    eligible: true,
    bankInfo: "HabibMetro (Acc: 423423423423)",
    reason: "Approved within 15 days window (7 days)",
    prompt: "What is the return status and bank account information for Syed's order ORD-106?",
  },
  {
    orderId: "ORD-107",
    customer: "Hussain",
    product: "Headphones",
    category: "Electronics",
    daysAgo: "10 days ago",
    status: "Pending Verification",
    eligible: true,
    reason: "Eligible (10 days ago is within 15-day electronics window)",
    prompt: "Is customer Hussain (order ORD-107) eligible to return his headphones purchased 10 days ago?",
  },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ onAskAgent }) => {
  return (
    <div className="flex flex-col h-full bg-[#111420] text-slate-200 p-4 overflow-y-auto">
      {/* Title */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span>Live Customer Orders & Refund Management Hub</span>
          </h2>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Synced with Google Sheet Orders & Bank_details
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Live customer orders with real-time 15-day electronics return guardrail evaluation and direct refund bank routing.
        </p>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#161a27] shadow-xl mb-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#1e2334] text-slate-300 font-semibold border-b border-white/10">
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Purchased</th>
              <th className="p-3 text-center">Return Status</th>
              <th className="p-3">Refund Bank Details</th>
              <th className="p-3 text-center">AI Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {LIVE_GOOGLE_SHEET_ORDERS.map((ord) => (
              <tr key={ord.orderId} className="hover:bg-white/[0.03] transition-colors">
                <td className="p-3 font-mono font-bold text-purple-300">{ord.orderId}</td>
                <td className="p-3 font-semibold text-white">{ord.customer}</td>
                <td className="p-3 text-slate-300 capitalize">{ord.product}</td>
                <td className="p-3 text-slate-400">{ord.category}</td>
                <td className="p-3 text-slate-300">{ord.daysAgo}</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                      ord.status === "Return Approved"
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                        : ord.eligible
                        ? "bg-indigo-950/60 text-indigo-300 border border-indigo-500/30"
                        : "bg-slate-800 text-slate-400 border border-white/10"
                    }`}
                  >
                    {ord.status === "Return Approved" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {ord.status}
                  </span>
                </td>
                <td className="p-3 text-slate-300 text-xs">
                  {ord.bankInfo ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Building2 className="w-3 h-3 text-emerald-400" />
                      {ord.bankInfo}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">—</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onAskAgent(ord.prompt)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-[11px] transition-all active:scale-95 shadow-sm"
                  >
                    <span>Check AI</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approved Refunds Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="p-3.5 rounded-xl bg-[#161a28] border border-emerald-500/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Approved Bank Refund Transfers
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">
              2 Active Refunds
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">John (ORD-103 • Phone)</span>
                <span className="text-[11px] text-slate-400 block">Meezan Bank — Acc: 9876543210</span>
              </div>
              <span className="text-emerald-400 font-medium text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded">
                Approved
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Syed (ORD-106 • Phone)</span>
                <span className="text-[11px] text-slate-400 block">HabibMetro — Acc: 423423423423</span>
              </div>
              <span className="text-emerald-400 font-medium text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded">
                Approved
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161a28] border border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Strict Policy Return Windows</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
              • **Electronics (Laptops, Phones, Headphones, Tablets):** Strict 15-day return window. Orders past 15 days (Ali, Sara, Mia, Abis) are rejected automatically.
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              • **Refund Timeline:** Direct bank transfers are processed within 5 business days to the designated account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
