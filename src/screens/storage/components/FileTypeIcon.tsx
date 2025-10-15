import React from "react";
import type { RecentFile } from "./types";

export const FileTypeIcon: React.FC<{
  file: RecentFile;
  className?: string;
}> = ({ file, className = "" }) => {
  return (
    <div
      className={`w-12 h-12 ${
        file.color ?? "bg-gray-400"
      } rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm ${className}`}
    >
      {file.type.toUpperCase()}
    </div>
  );
};

export default FileTypeIcon;
