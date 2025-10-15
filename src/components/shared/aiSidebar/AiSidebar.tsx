/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  LinkIcon,
  Maximize,
  MessageCircle,
  Navigation,
  Send,
  Wheat,
} from "lucide-react";
import ChatModal from "./ChatModal";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string; videoUrl?: string };

export default function AiSidebar({ aiUrl, context }: any) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string>(""); // Track session ID

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((s) => [...s, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Ensure context is a serialized string so backend receives full details
      const serializedContext =
        context && typeof context === "object" ? JSON.stringify(context) : context;

      const res = await fetch(`/api/${aiUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: serializedContext,
          messages: [...messages, userMsg], // Send full conversation history
          sessionId: sessionId || undefined, // Include session ID if exists
        }),
      });
  const data = await res.json();
  const reply = (data && data.reply) || "(no reply)";
  const imageUrl = data && data.imageUrl;
  const videoUrl = data && data.videoUrl;
  const newSessionId = data && data.sessionId;
      
      console.log("AI Response data:", data);
      console.log("Image URL received:", imageUrl);
      console.log("Session ID:", newSessionId);
      
      // Update session ID if received from server
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
      }
      
  setMessages((s) => [...s, { role: "assistant", content: reply, imageUrl, videoUrl }]);
    } catch (err) {
      console.error("AI request failed:", err);
      setMessages((s) => [
        ...s,
        { role: "assistant", content: "⚠️ Error: failed to reach API" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const headerAction = useMemo(
    () => (
      <button
        onClick={() => setIsModalOpen(true)}
        className="ml-auto p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Fullscreen"
      >
        <Maximize size={18} className="text-gray-600" />
      </button>
    ),
    []
  );

  return (
    <>
      {/* Sidebar Version */}
      <aside className="max-w-full h-[80vh] bg-white backdrop-blur-2xl border border-gray-200 rounded-3xl p-4 flex flex-col gap-4 shadow">
        {/* Header */}
        <div className="flex items-start gap-1">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-12 w-12"
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdBjDZmgcjezH0XD9snFi0tWGxgCzwB5Zpzg&s"
              alt=""
              className="h-10 w-10 rounded-full"
            />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-semibold">Seomi AI</div>
                <div className="text-xs text-gray-500">Social quick help</div>
              </div>
              {headerAction}
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto hidescroll rounded-2xl p-3 bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-inner"
        >
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const hasFile = /Example File|Downloads/i.test(m.content);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                  className={`max-w-[85%] ${
                    isUser ? "self-end" : "self-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isUser
                        ? "bg-gradient from:gray-100 to:white border border-gray-200 text-sky-900"
                        : "bg-white text-gray-900 border border-gray-100"
                    }`}
                  >
                    {hasFile ? (
                      <div className="flex flex-col gap-3">
                        <div className="text-sm leading-6 whitespace-pre-wrap">
                          {m.content.split("\n").slice(0, 2).join("\n")}
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            className="text-sm text-sky-600 font-medium"
                          >
                            Download
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">
                        {m.content}
                      </div>
                    )}
                    {m.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={m.imageUrl}
                          alt="Generated image"
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    {m.videoUrl && (
                      <div className="mt-2">
                        <video
                          src={m.videoUrl}
                          controls
                          className="rounded-lg max-w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-sm text-gray-500"
              >
                <div className="h-10 w-10 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center border border-gray-200">
                  <Wheat className="text-gray-200" />
                </div>
                <div>
                  <div className="animate-pulse">
                    Analyzing data, please wait...
                  </div>
                  <div className="text-xs text-gray-400">
                    Creating in-depth analysis · Identifying tasks
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Input */}
        <div className="pt-2">
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder={
                loading
                  ? "Analyzing..."
                  : "Ask, write or search for anything..."
              }
              className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
              aria-label="Ask Seomi AI"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={send}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full p-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md disabled:opacity-50"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        messages={messages}
        input={input}
        setInput={setInput}
        loading={loading}
        onSend={send}
      />
    </>
  );
}
