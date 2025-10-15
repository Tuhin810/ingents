import { Message } from "@/types/emailmarketing.types";
import { User, Bot, File } from "lucide-react";

type Props = {
  messages: Message[];
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
};

export default function ChatMessages({ messages, messagesEndRef }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 hidescroll">
      {messages.map((message) => (
        <div
          key={message._id} 
          className={`flex ${
            message.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`flex gap-3 max-w-2xl ${
              message.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                  : "bg-gradient-to-r from-gray-600 to-gray-700"
              }`}
            >
              {message.sender === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`flex flex-col gap-1 ${
                message.sender === "user" ? "items-end" : ""
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p> 
                {message.files && message.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.files.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-xs ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-600"
                        }`}
                      >
                        <File className="w-3 h-3" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span
                className={`text-xs text-gray-500 px-1 ${
                  message.sender === "user" ? "text-right" : ""
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} 
              </span>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
