"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, ShoppingCart, MessageSquare, Check, Scale, AlertCircle, CheckCircle2 } from "lucide-react";

export interface ProductItem {
  id: number;
  category: string;
  brand: string;
  model_name: string;
  key_specifications: string;
  best_for: string;
  price: number;
  stock: number;
}

interface ProductCatalogViewProps {
  products: ProductItem[];
  onAskAgent: (query: string) => void;
  onCompareProducts: (p1: ProductItem, p2: ProductItem) => void;
}

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = ({
  products,
  onAskAgent,
  onCompareProducts,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedForCompare, setSelectedForCompare] = useState<ProductItem[]>([]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.model_name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.key_specifications.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleCompare = (prod: ProductItem) => {
    if (selectedForCompare.find((p) => p.id === prod.id)) {
      setSelectedForCompare(selectedForCompare.filter((p) => p.id !== prod.id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert("You can select up to 3 products to compare.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, prod]);
    }
  };

  const handleTriggerCompare = () => {
    if (selectedForCompare.length < 2) return;
    const names = selectedForCompare.map((p) => p.model_name).join(" vs ");
    const prompt = `Can you generate a detailed comparison table between ${names} covering pricing, specifications, target audience, and stock levels?`;
    onAskAgent(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#111420] text-slate-200 p-4 overflow-y-auto">
      {/* Top Banner & Compare bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>TechMart Live Inventory Catalog</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Synced from products.xlsx
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stock and specs directly retrieved by Mind_dream AI.
          </p>
        </div>

        {/* Compare Floating CTA */}
        {selectedForCompare.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 px-3 rounded-lg bg-purple-950/80 border border-purple-500/40 text-xs">
            <Scale className="w-4 h-4 text-purple-400" />
            <span className="text-purple-200">
              {selectedForCompare.length} selected for comparison
            </span>
            <button
              onClick={handleTriggerCompare}
              disabled={selectedForCompare.length < 2}
              className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs transition-all"
            >
              Compare in Chat
            </button>
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-slate-400 hover:text-white text-xs underline ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by model, brand, or specifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#191e2e] border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-900/40"
                  : "bg-[#191e2e] text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#161a27] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#1e2334] text-slate-300 font-semibold border-b border-white/10">
              <th className="p-3 w-10 text-center">Compare</th>
              <th className="p-3">Product / Model</th>
              <th className="p-3">Category</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Key Specs</th>
              <th className="p-3">Best For</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-center">AI Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((prod) => {
              const isSelected = selectedForCompare.some((p) => p.id === prod.id);
              const inStock = prod.stock > 0;

              return (
                <tr
                  key={prod.id}
                  className={`hover:bg-white/[0.03] transition-colors ${
                    isSelected ? "bg-purple-900/20" : ""
                  }`}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCompare(prod)}
                      className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 font-semibold text-white whitespace-nowrap">
                    {prod.model_name}
                  </td>
                  <td className="p-3 text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                      {prod.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{prod.brand}</td>
                  <td className="p-3 text-slate-400 max-w-xs truncate" title={prod.key_specifications}>
                    {prod.key_specifications}
                  </td>
                  <td className="p-3 text-slate-400">{prod.best_for}</td>
                  <td className="p-3 text-right font-bold text-purple-300 whitespace-nowrap">
                    ${prod.price.toFixed(2)}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {inStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> {prod.stock} in stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-500/20 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Out of stock
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        onAskAgent(
                          `Can you provide complete specifications, stock level, pricing, and warranty coverage for the ${prod.model_name}?`
                        )
                      }
                      title="Ask Mind_dream about this product"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600/80 hover:bg-purple-600 text-white font-medium text-[11px] transition-all active:scale-95 shadow-sm"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Ask AI
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
