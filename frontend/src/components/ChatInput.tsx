"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, MicOff, X, FileText, Sparkles, CheckCircle2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: { name: string; size: string }) => void;
  isLoading: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  inputRef: externalInputRef,
}) => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);
  const [attachmentToast, setAttachmentToast] = useState(false);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!text.trim() && !attachment) || isLoading) return;
    onSendMessage(text.trim(), attachment || undefined);
    setText("");
    setAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / 1024).toFixed(1) + " KB";
      setAttachment({ name: file.name, size: sizeStr });
      setAttachmentToast(true);
      setTimeout(() => setAttachmentToast(false), 3000);
    }
  };

  const toggleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech recognition capture
      setTimeout(() => {
        setText((prev) => (prev ? prev + " Can you check the return policy?" : "Can you check the return policy for electronics?"));
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#0e111a] via-[#0e111a]/95 to-transparent pt-2 pb-3 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5">
        {/* Attachment preview if selected */}
        {attachment && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="font-medium truncate">{attachment.name}</span>
              <span className="text-purple-400/80 text-[11px]">({attachment.size})</span>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="p-1 hover:text-white text-purple-300 transition-colors"
              title="Remove attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Composer pill */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#181d2a] border border-white/10 shadow-xl focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.pdf,.png,.jpg,.jpeg,.csv,.xlsx"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach order receipt, invoice, or image"
            aria-label="Add attachment"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              isRecording
                ? "Listening... Speak your question..."
                : "Ask Mind_dream about products, pricing, policies, or order support..."
            }
            className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none min-w-0"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            title={isRecording ? "Stop recording" : "Voice input"}
            aria-label="Voice input"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              isRecording
                ? "bg-red-500/20 text-red-400 animate-pulse ring-2 ring-red-500/30"
                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && !attachment) || isLoading}
            aria-label="Send message"
            className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-95 transition-all flex-shrink-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Micro-copy Footer Indicator */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>
            Powered by Mind_dream • Grounded strictly in <code className="text-purple-300 font-mono text-[10px]">policy.txt</code> & <code className="text-purple-300 font-mono text-[10px]">products.xlsx</code>
          </span>
        </div>
      </div>
    </div>
  );
};
