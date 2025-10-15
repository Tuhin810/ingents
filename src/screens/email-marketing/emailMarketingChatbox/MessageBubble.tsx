import { User, Bot } from "lucide-react";

type MessageProps = {
  text: string;
  sender: "user" | "bot";
  time: string;
};

export default function MessageBubble({ text, sender, time }: MessageProps) {
  return (
    <div className={`flex ${sender === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-2xl ${sender === "user" ? "flex-row-reverse" : ""}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sender === "user" ? "bg-blue-500" : "bg-gray-600"} text-white`}>
          {sender === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        <div className="flex flex-col gap-1">
          <div className={`px-4 py-3 rounded-2xl ${sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
            {text}
          </div>
          <span className="text-xs text-gray-500 px-1">{time}</span>
        </div>
      </div>
    </div>
  );
}
