import React from "react";
import { FiMonitor, FiSmartphone, FiSave, FiSend } from "react-icons/fi";
import { ViewMode } from "../types";

interface TopToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Email Template Builder
        </h2>
      </div>
      <div className="flex items-center space-x-2">
        {/* Desktop/Mobile View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("desktop")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === "desktop"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FiMonitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => onViewModeChange("mobile")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === "mobile"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FiSmartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>

        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          <FiSave className="w-4 h-4 mr-2 inline" />
          Save
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
          <FiSend className="w-4 h-4 mr-2 inline" />
          Send Test
        </button>
      </div>
    </div>
  );
};
