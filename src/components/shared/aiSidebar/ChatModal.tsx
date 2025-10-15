/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  X,
  Paperclip,
  FolderOpen,
  Mic,
  FileText,
  Check,
  Wheat,
  FolderDown,
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Msg[];
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  onSend: () => void;
}

export default function ChatModal({
  isOpen,
  onClose,
  messages,
  input,
  setInput,
  loading,
  onSend,
}: ChatModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [savedChats, setSavedChats] = useState<
    Array<{ id: string; content: string; savedAt: string }>
  >([]);
  const [isFolderDragOver, setIsFolderDragOver] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropSuccess, setDropSuccess] = useState(false);
  const dragImageRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when new messages come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center w-full
      justify-center p-4 bg-white/10 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-8xl h-[94vh] bg-white rounded-3xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        {/* Chat Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto hidescroll bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="h-12 w-12"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdBjDZmgcjezH0XD9snFi0tWGxgCzwB5Zpzg&s"
                  alt="Seomi AI"
                  className="h-10 w-10 rounded-full"
                />
              </motion.div>
              <div>
                <div className="text-lg font-semibold">Seomi AI</div>
                <div className="text-sm text-gray-500">
                  Advanced AI Assistant - Full Screen Mode
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Additional action buttons can be added here */}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close Chat Modal"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
          {messages.length <= 1 ? (
            // Welcome Screen - Similar to the image
            <div className="flex-1 flex flex-col items-center justify-center px-8 pb-32">
              {/* AI Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <div className="    ">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdBjDZmgcjezH0XD9snFi0tWGxgCzwB5Zpzg&s"
                    alt="Seomi AI"
                    className="w-12 h-12 rounded-xl"
                  />
                </div>
              </motion.div>

              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-semibold text-gray-800 mb-3">
                  Hi, Seomi AI
                </h2>
                <p className="text-gray-600 text-lg max-w-md">
                  Can I help you with anything?
                </p>
                <p className="text-gray-500 text-sm mt-2 max-w-lg">
                  Ready to assist you with anything you need, from answering
                  questions to providing recommendations. Let's get started!
                </p>
              </motion.div>

              {/* Suggested Prompts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8"
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setInput("Analyze my website's SEO performance")
                  }
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg">
                      <Sparkles />
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    SEO Analysis
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Get comprehensive SEO insights
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput("Help me create content strategy")}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg">
                      <Brain />
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Content Strategy
                  </h3>
                  <p className="text-gray-600 text-sm">
                    AI-powered content recommendations
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setInput("Show me trending topics in my industry")
                  }
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg">
                      <TrendingUp />
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Trending Topics
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Discover what's trending now
                  </p>
                </motion.button>
              </motion.div>
            </div>
          ) : (
            // Chat Messages
            <div className="flex flex-col gap-4 max-w-4xl mx-auto p-8 w-full pb-32">
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                const hasFile = /Example File|Downloads/i.test(m.content);

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.02 }}
                    className={`max-w-[80%] ${
                      isUser ? "self-end" : "self-start"
                    }`}
                  >
                    <div
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        try {
                          e.dataTransfer.setData(
                            "application/chat",
                            JSON.stringify({ index: i, content: m.content })
                          );
                          e.dataTransfer.effectAllowed = "copy";

                          // If we have a custom drag image element, use it so the
                          // dragged message looks like the FileText icon instead
                          // of a faint preview of the bubble.
                          if (dragImageRef.current) {
                            // ensure the element is visible for setDragImage (some browsers require it)
                            dragImageRef.current.style.display = "flex";
                            // offset so cursor sits nicely on the icon
                            e.dataTransfer.setDragImage(
                              dragImageRef.current,
                              16,
                              16
                            );
                          }
                        } catch (err) {
                          /* ignore */
                        }
                        setIsDragging(true);
                      }}
                      onDragEnd={() => {
                        // hide the offscreen drag image after drag ends
                        if (dragImageRef.current) {
                          dragImageRef.current.style.display = "none";
                        }
                        setIsDragging(false);
                      }}
                    >
                      <div
                        className={`rounded-t-[1.3rem] px-5 py-3 ${
                          isUser
                            ? "rounded-l-[1.3rem] bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "rounded-r-[1.3rem] bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200 shadow-lg"
                        }`}
                      >
                        {hasFile ? (
                          <div className="flex flex-col gap-3">
                            <div className="text-sm leading-6 whitespace-pre-wrap">
                              {m.content.split("\n").slice(0, 2).join("\n")}
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
                              >
                                Download
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {m.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-sm text-gray-500 self-start"
                >
                  <div className="h-10 w-10 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center border border-gray-200">
                    <Wheat className="text-gray-200" />
                  </div>
                  <div>
                    <div className="animate-pulse font-medium">
                      Seomi AI is thinking...
                    </div>
                    {/* <div className="text-xs text-gray-400">
                      Processing your request • Analyzing context
                    </div> */}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Hidden drag image element used for setDragImage */}
        <div
          ref={dragImageRef}
          style={{
            display: "none",
            position: "absolute",
            top: -9999,
            left: -9999,
          }}
          className="cursor-move"
          //   aria-hidden
        >
          <div className="cursor-move p-2 h-20 w-16 border-2 border-gray-200 bg-white rounded-xl shadow flex items-center justify-center">
            <FileText size={26} className="text-gray-700" />
          </div>
        </div>

        {/* Enhanced Input Area - Fixed at bottom */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex gap-3 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsFolderDragOver(true);
                }}
                onDragLeave={() => setIsFolderDragOver(false)}
                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setIsFolderDragOver(false);
                  try {
                    const data = e.dataTransfer.getData("application/chat");
                    if (data) {
                      const parsed = JSON.parse(data);
                      const id = String(Date.now());
                      setSavedChats((s) => [
                        {
                          id,
                          content: parsed.content,
                          savedAt: new Date().toISOString(),
                        },
                        ...s,
                      ]);
                      // success indicator
                      setDropSuccess(true);
                      setTimeout(() => setDropSuccess(false), 1400);
                    }
                  } catch (err) {
                    /* ignore */
                  }
                }}
                className={`p-2  border border-gray-400 rounded-full transition-colors cursor-pointer ${
                  isFolderDragOver ? "bg-green-50 border-green-400" : "bg-white"
                }`}
                title={
                  isDragging ? "Release to save" : "Drop chat here to save"
                }
              >
                {isDragging ? (
                  <div className="flex items-center gap-1">
                    <FolderDown size={20} className="text-gray-700" />
                  </div>
                ) : (
                  <FolderOpen size={22} className="text-gray-600" />
                )}
              </div>

              {/* Drop success indicator */}
              {dropSuccess && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 rounded-full w-12 h-12 flex items-center justify-center shadow">
                  <Check size={18} className="text-green-600" />
                </div>
              )}

              {savedChats.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {savedChats.length}
                </div>
              )}

              {showSavedList && (
                <div className="absolute mt-2 right-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
                  <div className="text-sm font-semibold mb-2">Saved Chats</div>
                  <div className="flex flex-col gap-2 max-h-48 overflow-auto">
                    {savedChats.map((c) => (
                      <div
                        key={c.id}
                        className="text-xs text-gray-700 border-b pb-2"
                      >
                        <div className="font-medium truncate">{c.content}</div>
                        <div className="text-gray-400 text-[10px]">
                          {new Date(c.savedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {savedChats.length === 0 && (
                      <div className="text-xs text-gray-400">
                        No saved chats
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  if (f) {
                    setAttachedFile(f);
                    setInput(`Attached: ${f.name}`);
                  }
                }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 border border-gray-400 rounded-full transition-colors"
                aria-label="Attach file"
              >
                <Paperclip size={20} className="text-gray-600" />
                {/* 📎 */}
              </button>

              {attachedFile && (
                <div className="text-sm text-gray-600 truncate max-w-xs">
                  {attachedFile.name}
                </div>
              )}
              <button className="p-2 hover:bg-gray-600  border bg-gray-700 border-gray-700  rounded-full transition-colors">
                <Mic size={22} className="text-gray-100" />
              </button>
            </div>
            <div className="flex-1 max-w-4xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder={
                  loading
                    ? "Seomi AI is responding..."
                    : "Ask SayHalo anything..."
                }
                className="w-full rounded-full border border-gray-300 px-6 py-4 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 disabled:opacity-50"
                disabled={loading}
                aria-label="Chat with Seomi AI"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSend}
              disabled={loading || !input.trim()}
              className="rounded-full p-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
            >
              <Send size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
