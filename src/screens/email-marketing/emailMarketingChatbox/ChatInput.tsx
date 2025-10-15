import { Send, Paperclip } from "lucide-react";
import { ChangeEvent, KeyboardEvent } from "react";

type Props = {
  inputMessage: string;
  setInputMessage: (val: string) => void;
  handleSendMessage: () => void;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function ChatInput({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleFileUpload,
  fileInputRef,
}: Props) {
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white/90">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-200 placeholder-gray-400"
            rows={3}
          />
          <button
            onClick={() => fileInputRef?.current?.click()}
            className="absolute right-3 bottom-3 p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <button
          onClick={handleSendMessage}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="font-medium">Send</span>
        </button>
      </div>
    </div>
  );
}
