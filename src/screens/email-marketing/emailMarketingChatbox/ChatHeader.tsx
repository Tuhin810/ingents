import { Chat } from "@/types/emailmarketing.types";
import { MessageCircle } from "lucide-react";

type Props = {
  activeChat: string; 
  chats: Chat[];
};

export default function ChatHeader({ activeChat, chats }: Props) {
  const chat = chats.find((c) => c._id === activeChat); 

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white/90">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {chat?.title || "Chat"}
          </h2>
          <p className="text-sm text-gray-500">Active conversation</p>
        </div>
      </div>
    </div>
  );
}
