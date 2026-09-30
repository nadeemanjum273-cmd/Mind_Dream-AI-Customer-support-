"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  MessageSquare, 
  Grid, 
  Package, 
  Database, 
  Sparkles, 
  Columns,
  ShoppingCart
} from "lucide-react";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageList, ChatMessage } from "@/components/MessageList";
import { ChatInput } from "@/components/ChatInput";
import { ProductCatalogView, ProductItem } from "@/components/ProductCatalogView";
import { OrderTrackingView } from "@/components/OrderTrackingView";
import { KnowledgeBaseView } from "@/components/KnowledgeBaseView";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: `Hi there! 👋 Welcome to **TechMart**. I am **Mind_Dream**, your intelligent sales, ordering, and customer support agent.

I have direct access to our live inventory catalog, customer orders, and return policy records.

### How can I help you today?
* 🛍️ **Place an order**: Tell me what you'd like to buy (e.g. *"Please place an order for MacBook Air for Alex"*)
* 💳 **Process returns & refunds**: Provide your order ID and bank details to schedule direct refund transfer
* 🔍 **Check product stock & prices**: Compare laptops, headphones, phones, keyboards & mice
* 📋 **Store policy details**: 15-day electronics return window, free standard shipping over $50`,
    timestamp: "10:24 AM",
    sources: [
      {
        source: "google_drive_data.xlsx",
        type: "store_data",
        content: "Live Products, Orders, and Bank_details sheets connected",
      },
      {
        source: "policy.txt",
        type: "policy",
        content: "TechMart Customer Policies: 15-day electronics return, 5-day refund window",
      },
    ],
  },
];

const INITIAL_PRODUCTS: ProductItem[] = [
  { id: 1, category: "Laptop", brand: "Apple", model_name: "MacBook Air M3", key_specifications: '13.6", Apple M3, 16GB RAM, 512GB SSD', best_for: "Students & Professionals", price: 799.99, stock: 8 },
  { id: 2, category: "Laptop", brand: "Dell", model_name: "XPS 15 9530", key_specifications: "Intel Core i7, RTX 4050, 16GB RAM", best_for: "Creators & Office Work", price: 149.99, stock: 0 },
  { id: 3, category: "Laptop", brand: "Lenovo", model_name: "Legion Pro 5", key_specifications: "Ryzen 9, RTX 4070, 32GB RAM", best_for: "Gaming", price: 499.99, stock: 15 },
  { id: 4, category: "Laptop", brand: "HP", model_name: "Spectre x360 14", key_specifications: "OLED Touchscreen, Intel Evo", best_for: "Business & Travel", price: 329.99, stock: 4 },
  { id: 5, category: "Headphones", brand: "Sony", model_name: "WH-1000XM5", key_specifications: "Noise Cancelling, 30hr Battery", best_for: "Music & Travel", price: 59.99, stock: 22 },
  { id: 6, category: "Headphones", brand: "Apple", model_name: "AirPods Max", key_specifications: "Spatial Audio, Premium Build", best_for: "Apple Ecosystem", price: 29.99, stock: 35 },
  { id: 7, category: "Headphones", brand: "Bose", model_name: "QuietComfort Ultra", key_specifications: "ANC, Comfortable Fit", best_for: "Frequent Travelers", price: 799.99, stock: 8 },
  { id: 8, category: "Phone", brand: "Samsung", model_name: "Galaxy S25 Ultra", key_specifications: "Snapdragon 8 Gen 4, 200MP Camera", best_for: "Photography", price: 149.99, stock: 0 },
  { id: 9, category: "Phone", brand: "Apple", model_name: "iPhone 16 Pro Max", key_specifications: "A18 Pro Chip, Titanium Design", best_for: "Premium Users", price: 499.99, stock: 15 },
  { id: 10, category: "Phone", brand: "Google", model_name: "Pixel 9 Pro", key_specifications: "AI Features, Excellent Camera", best_for: "Android Users", price: 329.99, stock: 4 },
  { id: 11, category: "Phone", brand: "OnePlus", model_name: "OnePlus 13", key_specifications: "Fast Charging, AMOLED Display", best_for: "Performance", price: 59.99, stock: 22 },
  { id: 12, category: "Tablet", brand: "Apple", model_name: "iPad Pro M4", key_specifications: "OLED Display, Apple Pencil Pro", best_for: "Designers", price: 29.99, stock: 35 },
  { id: 13, category: "Tablet", brand: "Samsung", model_name: "Galaxy Tab S10 Ultra", key_specifications: '14.6" AMOLED, S-Pen', best_for: "Entertainment", price: 799.99, stock: 8 },
  { id: 14, category: "Tablet", brand: "Xiaomi", model_name: "Pad 7 Pro", key_specifications: "Snapdragon Processor, 144Hz", best_for: "Budget Premium", price: 149.99, stock: 0 },
  { id: 15, category: "Keyboard", brand: "Logitech", model_name: "MX Keys S", key_specifications: "Wireless, Backlit Keys", best_for: "Productivity", price: 499.99, stock: 15 },
  { id: 16, category: "Keyboard", brand: "Keychron", model_name: "Keychron K8 Pro", key_specifications: "Mechanical, Hot-Swappable", best_for: "Programmers", price: 329.99, stock: 4 },
  { id: 17, category: "Keyboard", brand: "Razer", model_name: "BlackWidow V4", key_specifications: "RGB Mechanical Keyboard", best_for: "Gamers", price: 59.99, stock: 22 },
  { id: 18, category: "Mouse", brand: "Logitech", model_name: "MX Master 3S", key_specifications: "Ergonomic, Silent Clicks", best_for: "Office & Editing", price: 29.99, stock: 35 },
  { id: 19, category: "Mouse", brand: "Razer", model_name: "DeathAdder V3 Pro", key_specifications: "Lightweight, Wireless Gaming", best_for: "Esports", price: 499.99, stock: 4 },
  { id: 20, category: "Mouse", brand: "SteelSeries", model_name: "Aerox 5 Wireless", key_specifications: "Ultra-Lightweight, RGB", best_for: "Gaming & Streaming", price: 329.99, stock: 22 },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"chat" | "catalog" | "orders" | "rag">("chat");
  const [layoutMode, setLayoutMode] = useState<"split" | "focused">("split");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.log("Using initial products");
      }
    }
    loadProducts();
  }, []);

  const handleSendMessage = async (text: string, attachment?: { name: string; size: string }) => {
    if (!text.trim() && !attachment) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text + (attachment ? ` [User attached file: ${attachment.name}]` : ""),
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I don't know",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: data.retrieved_docs || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ I encountered a temporary connection issue. Please check your internet connection or try sending your message again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    if (activeTab !== "chat") {
      setActiveTab("chat");
    }
    handleSendMessage(prompt);
  };

  const handleRestart = () => {
    if (window.confirm("Restart conversation with Mind_Dream?")) {
      setMessages(INITIAL_MESSAGES);
    }
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      const res = await fetch("/api/reindex", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        console.log("Reindex result:", data);
      }
    } catch (err) {
      console.error("Reindex error:", err);
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0f18] text-slate-100">
      {/* Top Main Navigation Bar */}
      <nav className="h-14 border-b border-white/10 bg-[#121624] px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-[1.5px] flex items-center justify-center shadow-md shadow-purple-900/40">
              <div className="w-full h-full bg-[#0e111a] rounded-[6.5px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-wide leading-none">
                TechMart
              </span>
              <span className="text-[10px] text-amber-300 font-semibold tracking-wider">
                Mind_Dream Agent Hub
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-purple-600/30 text-purple-200 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>Live Support & Orders</span>
            </button>

            <button
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "catalog"
                  ? "bg-purple-600/30 text-purple-200 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-indigo-400" />
              <span>Product Catalog ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "orders"
                  ? "bg-purple-600/30 text-purple-200 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Orders & Refunds (7)</span>
            </button>

            <button
              onClick={() => setActiveTab("rag")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "rag"
                  ? "bg-purple-600/30 text-purple-200 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>RAG Knowledge</span>
            </button>
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayoutMode(layoutMode === "split" ? "focused" : "split")}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/5 transition-all"
            title="Toggle Split Dashboard View"
          >
            <Columns className="w-3.5 h-3.5 text-purple-400" />
            <span>{layoutMode === "split" ? "Side-by-Side" : "Full View"}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-slate-200">Online</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {layoutMode === "split" && activeTab !== "chat" && (
          <div className="w-1/2 h-full border-r border-white/10 flex flex-col overflow-hidden bg-[#111420]">
            {activeTab === "catalog" && (
              <ProductCatalogView
                products={products}
                onAskAgent={handleSendMessage}
                onCompareProducts={() => {}}
              />
            )}
            {activeTab === "orders" && (
              <OrderTrackingView onAskAgent={handleSendMessage} />
            )}
            {activeTab === "rag" && (
              <KnowledgeBaseView
                onReindex={handleReindex}
                isReindexing={isReindexing}
              />
            )}
          </div>
        )}

        {layoutMode === "focused" && activeTab !== "chat" && (
          <div className="w-full h-full flex flex-col overflow-hidden bg-[#111420]">
            {activeTab === "catalog" && (
              <ProductCatalogView
                products={products}
                onAskAgent={handleSendMessage}
                onCompareProducts={() => {}}
              />
            )}
            {activeTab === "orders" && (
              <OrderTrackingView onAskAgent={handleSendMessage} />
            )}
            {activeTab === "rag" && (
              <KnowledgeBaseView
                onReindex={handleReindex}
                isReindexing={isReindexing}
              />
            )}
          </div>
        )}

        {/* Chat Widget Container */}
        {(activeTab === "chat" || layoutMode === "split") && (
          <div
            className={`flex flex-col h-full bg-[#0e111a] overflow-hidden ${
              layoutMode === "split" && activeTab !== "chat" ? "w-1/2" : "w-full"
            }`}
          >
            {/* Context Strip */}
            <div className="px-4 py-1.5 flex items-center justify-between bg-[#151926] border-b border-white/5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-slate-300 font-medium">
                  Active Session • Mind_Dream Store Assistant
                </span>
              </div>
              <div className="flex items-center gap-2 text-purple-300">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono">
                  Orders & Bank Details Synced
                </span>
              </div>
            </div>

            {/* Chat Header */}
            <ChatHeader
              onRestart={handleRestart}
              isExpanded={layoutMode === "focused" && activeTab === "chat"}
              onToggleExpand={() =>
                setLayoutMode(layoutMode === "split" ? "focused" : "split")
              }
              onOpenKnowledge={() => setActiveTab("rag")}
            />

            {/* Message Stream */}
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onSelectPrompt={handleSendMessage}
            />

            {/* Sticky Composer */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              inputRef={chatInputRef}
            />
          </div>
        )}
      </main>
    </div>
  );
}
