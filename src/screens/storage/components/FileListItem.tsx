import React from "react";
import type { RecentFile } from "./types";
import FileTypeIcon from "./FileTypeIcon";

export const FileListItem: React.FC<{ file: RecentFile }> = ({ file }) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 group">
      <div className="flex items-center space-x-3">
        <FileTypeIcon file={file} />
        <div>
          <h3 className="font-medium text-gray-800">{file.name}</h3>
          <p className="text-sm text-gray-500">
            {file.date} • {file.size}
          </p>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FileListItem;
