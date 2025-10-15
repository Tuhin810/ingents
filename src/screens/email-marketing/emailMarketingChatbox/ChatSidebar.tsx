import { Chat } from "@/types/emailmarketing.types";
import { MessageCircle, Plus } from "lucide-react";

type Props = {
  chats: Chat[];
  createNewChat: () => void;
  selectChat: (id: string) => void; 
};

export default function ChatSidebar({ chats, createNewChat, selectChat }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hidescroll">
        <div className="p-3 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => selectChat(chat._id)} 
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                chat.active
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                  : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    chat.active
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-medium truncate ${
                        chat.active ? "text-blue-900" : "text-gray-900"
                      }`}
                    >
                      {chat.title} 
                    </p>
                    <span
                      className={`text-xs ${
                        chat.active ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {chat.updatedAt
                        ? new Date(chat.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate mt-1 ${
                      chat.active ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
