"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "../../layout/Layout";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import FilePreview from "./FilePreview";
import ChatInput from "./ChatInput";
import { Minimize } from "lucide-react";
import { Chat, Message, FileInfo } from "@/types/emailmarketing.types";
import { initiateSocket, getSocket } from "../../../lib/socket/socket";

type Props = {
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean) => void;
};

const EmailMarketingChatbox = ({ isFullScreen, setIsFullScreen }: Props) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // Socket
  useEffect(() => {
    const userToken = getCookie("token");
    if (!userToken) return;

    initiateSocket(userToken);
    const socket = getSocket();
    if (!socket) return;

    const handleIncomingMessage = (msg: Message) => {
      if (msg.chatId === activeChat) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("message", handleIncomingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
      socket.disconnect();
    };
  }, [activeChat]);

  // Fetch chats
  const fetchChats = async () => {
    try {
      const res = await fetch("/api/emailMarketing", {
        method: "GET",
        // DO NOT set Content-Type: browser will set multipart/form-data boundary
      });

      const data: Chat[] = await res.json();
      setChats(data);

      // Automatically set first chat as active (if it exists)
      if (data.length > 0) {
        setActiveChat(data[0]._id);
      }
    } catch (err) {
      console.error("[ERROR] Fetching chats failed:", err);
      setChats([]);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch messages for active chat
  const fetchMessages = async (chatId: string) => {
    try {
      console.log(`[LOG] Fetching messages for chat ${chatId} via proxy...`);
      const res = await fetch(`/api/emailMarketing/${chatId}/messages`, {
        method: "GET",
      });
      const data = await res.json();
      console.log("[LOG] Messages fetched active chat:", data);
      setMessages(data);
    } catch (err) {
      console.error("[ERROR] Fetching messages failed:", err);
    }
  };

  useEffect(() => {
    console.log("use effect called");
    if (activeChat) fetchMessages(activeChat);
    console.log(activeChat);
  }, [activeChat]);

  // Send message
  const handleSendMessage = async () => {
    if (!activeChat) return;

    const tempMsg: Message = {
      _id: `temp-${Date.now()}`,
      chatId: activeChat,
      sender: "user",
      content: inputMessage,
      createdAt: new Date().toISOString(),
      files: uploadedFiles.length
        ? uploadedFiles.map((f) => ({
            name: f.name,
            size: (f.size / 1024).toFixed(2) + " KB",
          }))
        : [],
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputMessage("");
    setUploadedFiles([]);

    try {
      console.log(`[LOG] Sending message to chat ${activeChat} via proxy...`);

      const payload: any = {
        chatId: activeChat,
        sender: "user",
        content: inputMessage,
      };

      if (uploadedFiles.length > 0) {
        const filesWithData = await Promise.all(
          uploadedFiles.map(async (file) => {
            if ((file as any).data) return file;
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  name: file.name,
                  type: (file as any).type || "application/octet-stream",
                  size: file.size,
                  data: (reader.result as string).split(",")[1], 
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file as unknown as Blob);
            });
          })
        );
        payload.files = filesWithData;
      }

      if (
        inputMessage.startsWith("http://") ||
        inputMessage.startsWith("https://")
      ) {
        payload.fileUrl = inputMessage;
        payload.content = inputMessage; 
      }

      const res = await fetch("/api/emailMarketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[LOG] Message sent:", data);

      setMessages((prev) =>
        prev.map((m) => (m._id === tempMsg._id ? data : m))
      );

      const socket = getSocket();
      socket?.emit("sendMessage", { room: activeChat, msg: data });
    } catch (err) {
      console.error("[ERROR] Sending message failed:", err);
    }
  };

  // Select chat
  const selectChat = (chatId: string) => {
    setActiveChat(chatId);
    setChats((prev) => prev.map((c) => ({ ...c, active: c._id === chatId })));
  };

  // Create new chat
  const createNewChat = async () => {
    const userToken = getCookie("token");
    if (!userToken) return;

    try {
      console.log("[LOG] Creating new chat via proxy...");
      const res = await fetch("/api/emailMarketing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newChat: true }),
      });

      const data = await res.json();
      console.log("[LOG] New chat created:", data);

      const newChat = { ...data, active: true };
      setChats((prev) => [
        newChat,
        ...prev.map((c) => ({ ...c, active: false })),
      ]);
      setActiveChat(data._id);
      setMessages([]);
    } catch (err) {
      console.error("[ERROR] Creating new chat failed:", err);
    }
  };

  return (
    <Layout>
      <div className="mx-auto px-5 max-w-7xl font-sans gap-5 flex flex-col lg:flex-row">
        <div className="flex-grow lg:col-span-8 h-[83vh] flex overflow-y-auto pb-10 hidescroll">
          <ChatSidebar
            chats={chats}
            createNewChat={createNewChat}
            selectChat={selectChat}
          />
          <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm">
            <ChatHeader activeChat={activeChat ?? ""} chats={chats} />
            <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
            <FilePreview
              files={uploadedFiles.map((f) => ({
                name: f.name,
                size: (f.size / 1024).toFixed(2) + " KB",
              }))}
              removeFile={(i) =>
                setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
            <ChatInput
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
              handleFileUpload={(e) => {
                const files = Array.from(e.target.files ?? []);
                setUploadedFiles((prev) => [...prev, ...files]);
              }}
              fileInputRef={fileInputRef}
            />
          </div>
          <div className="px-2 flex items-start">
            <button onClick={() => setIsFullScreen(false)}>
              <Minimize size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailMarketingChatbox;
