"use client";

import React, { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  User, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Database, 
  FileText,
  Sparkles
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: Array<{
    source: string;
    type?: string;
    content?: string;
    metadata?: any;
  }>;
  attachment?: {
    name: string;
    size: string;
  };
}

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectPrompt?: (prompt: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    setFeedback((prev) => ({ ...prev, [id]: type }));
  };

  const toggleSources = (id: string) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 max-w-4xl mx-auto w-full">
      {/* Date timeline stamp */}
      <div className="flex items-center justify-center">
        <span className="px-3 py-1 rounded-full bg-[#181d2c] border border-white/5 text-[11px] font-medium text-slate-400">
          Today • Live Mind_Dream Session
        </span>
      </div>

      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={`flex items-start gap-3 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
              {isUser ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-md">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-[1.5px] shadow-md flex items-center justify-center">
                  <div className="w-full h-full bg-[#111420] rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Bubble Container */}
            <div className={`flex flex-col gap-1 max-w-[88%] sm:max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
              {/* Header Info */}
              <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">
                  {isUser ? "You" : "Mind_Dream"}
                </span>
                <span>•</span>
                <span>{message.timestamp}</span>
              </div>

              {/* Message Content Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  isUser
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs"
                    : "bg-[#181d2a] border border-white/10 text-slate-200 rounded-tl-xs"
                }`}
              >
                {/* User Attachment Tag */}
                {message.attachment && (
                  <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/20 text-purple-200 text-xs border border-white/10">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attached: {message.attachment.name}</span>
                  </div>
                )}

                {/* Markdown Rendering */}
                <div className="prose prose-invert max-w-none text-slate-200 text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Sources Section (For AI message) */}
                {!isUser && message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => toggleSources(message.id)}
                      className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-medium transition-colors"
                    >
                      <Database className="w-3.5 h-3.5 text-purple-400" />
                      <span>
                        Retrieved Context ({message.sources.length} sources)
                      </span>
                      <span className="text-[10px] text-purple-400">
                        {expandedSources[message.id] ? "▲ Hide" : "▼ Show details"}
                      </span>
                    </button>

                    {expandedSources[message.id] && (
                      <div className="mt-2 space-y-2 bg-[#10141f] p-2.5 rounded-lg border border-purple-500/20 text-xs">
                        {message.sources.map((src, i) => (
                          <div key={i} className="text-slate-300">
                            <div className="flex items-center justify-between text-[11px] text-purple-300 font-semibold mb-1">
                              <span>
                                #{i + 1} Source: {src.source}
                              </span>
                              {src.metadata?.order_id && (
                                <span className="text-emerald-400 font-mono">
                                  Order: {src.metadata.order_id}
                                </span>
                              )}
                              {src.metadata?.category && (
                                <span className="text-slate-400">
                                  Category: {src.metadata.category}
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[11px] text-slate-400 bg-black/30 p-1.5 rounded border border-white/5 whitespace-pre-wrap">
                              {src.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bot Interaction Action Row */}
              {!isUser && (
                <div className="flex items-center justify-between w-full px-1 pt-1 text-slate-400 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400">Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback(message.id, "up")}
                      className={`p-1 rounded-md transition-colors ${
                        feedback[message.id] === "up"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "hover:text-slate-200 hover:bg-white/5"
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, "down")}
                      className={`p-1 rounded-md transition-colors ${
                        feedback[message.id] === "down"
                          ? "text-rose-400 bg-rose-500/10"
                          : "hover:text-slate-200 hover:bg-white/5"
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="flex items-center gap-1 hover:text-slate-200 hover:bg-white/5 px-2 py-0.5 rounded-md transition-all text-[11px]"
                    title="Copy to clipboard"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex items-start gap-3 w-full">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/40 shadow-md bg-black flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Mind_Dream Logo"
              width={32}
              height={32}
              className="object-cover w-full h-full animate-pulse"
            />
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#181d2a] border border-white/10 text-slate-200 shadow-md">
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              <span>Mind_Dream is processing orders, catalog & policy records...</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-full bg-amber-400/80 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-purple-400/80 animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-indigo-400/80 animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
