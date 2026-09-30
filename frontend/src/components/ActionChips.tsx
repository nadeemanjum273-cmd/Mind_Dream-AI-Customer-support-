"use client";

import React from "react";
import { 
  Package, 
  Search, 
  CreditCard, 
  Laptop, 
  ShieldAlert, 
  Truck, 
  Headphones, 
  HelpCircle,
  Sparkles,
  Building2,
  CheckCircle2
} from "lucide-react";

interface ActionChipsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    label: "John's refund status (ORD-103)",
    query: "What is the refund status and bank account details for John's order ORD-103?",
  },
  {
    icon: <CreditCard className="w-3.5 h-3.5 text-amber-400" />,
    label: "Can Sara return order ORD-102?",
    query: "Can customer Sara return order ORD-102 (headphones) purchased 18 days ago under your electronics policy?",
  },
  {
    icon: <Building2 className="w-3.5 h-3.5 text-sky-400" />,
    label: "All approved bank refunds",
    query: "Which customers currently have approved returns, and what are their designated bank accounts?",
  },
  {
    icon: <Search className="w-3.5 h-3.5 text-indigo-400" />,
    label: "Check product availability",
    query: "Can you check product availability and stock levels for your laptops and headphones?",
  },
  {
    icon: <Laptop className="w-3.5 h-3.5 text-purple-400" />,
    label: "Compare MacBook Air vs Legion Pro",
    query: "Can you compare the MacBook Air M3 and Lenovo Legion Pro 5 in a table with prices, specs, and stock?",
  },
  {
    icon: <Package className="w-3.5 h-3.5 text-teal-400" />,
    label: "What is your refund policy?",
    query: "What is your refund and return policy? How many days do I have to return an item?",
  },
  {
    icon: <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />,
    label: "Warranty coverage details",
    query: "What does your 1-year manufacturer warranty cover, and how do I file a warranty claim?",
  },
];

export const ActionChips: React.FC<ActionChipsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="w-full py-2 px-3 border-t border-white/5 bg-[#121622]/80 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mr-1 flex-shrink-0 select-none">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Quick Prompts:</span>
        </div>
        {QUICK_PROMPTS.map((chip, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => onSelectPrompt(chip.query)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e2334] hover:bg-[#282f45] text-slate-200 hover:text-white border border-white/10 hover:border-purple-500/40 text-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group shadow-sm"
          >
            <span className="transition-transform group-hover:scale-110">
              {chip.icon}
            </span>
            <span className="whitespace-nowrap font-normal">{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
