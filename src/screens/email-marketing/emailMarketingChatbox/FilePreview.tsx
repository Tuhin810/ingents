import { FileInfo } from "@/types/emailmarketing.types";
import { X, File } from "lucide-react";


type Props = {
  files: FileInfo[];
  removeFile: (index: number) => void;
};

export default function FilePreview({ files, removeFile }: Props) {
  if (files.length === 0) return null;

  return (
    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200"
          >
            <File className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{file.name}</span>
            <span className="text-xs text-gray-500">({file.size})</span>
            <button
              onClick={() => removeFile(index)}
              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
