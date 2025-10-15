import React from "react";
import {
  FiType,
  FiSquare,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
} from "react-icons/fi";
import { ActiveTab } from "../types";
import {
  textMediaComponents,
  buttonQuoteComponents,
  dividerSignatureComponents,
} from "../constants/componentData";
import { DraggableItem } from "./DraggableItem";

interface LeftSidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="w-80 bg-white/10 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-800">Contents</h1>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiRotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiRotateCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onTabChange("contents")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "contents"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Contents
          </button>
          <button
            onClick={() => onTabChange("settings")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "settings"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Component Sections */}
      <div className="flex-1 h-[60vh] overflow-y-scroll p-4 space-y-6">
        {activeTab === "contents" ? (
          <>
            {/* Text & Media */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FiType className="w-4 h-4 mr-2" />
                Text & media
              </h3>
              <div className="space-y-2">
                {textMediaComponents.map((comp) => (
                  <DraggableItem
                    key={comp.type}
                    type={comp.type}
                    icon={comp.icon}
                    label={comp.label}
                  />
                ))}
              </div>
            </div>

            {/* Buttons & Quote */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FiSquare className="w-4 h-4 mr-2" />
                Buttons & quote
              </h3>
              <div className="space-y-2">
                {buttonQuoteComponents.map((comp) => (
                  <DraggableItem
                    key={comp.type}
                    type={comp.type}
                    icon={comp.icon}
                    label={comp.label}
                  />
                ))}
              </div>
            </div>

            {/* Divider & Signature */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FiMinus className="w-4 h-4 mr-2" />
                Divider & signature
              </h3>
              <div className="space-y-2">
                {dividerSignatureComponents.map((comp) => (
                  <DraggableItem
                    key={comp.type}
                    type={comp.type}
                    icon={comp.icon}
                    label={comp.label}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          // Settings panel
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Email Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="My Email Template"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Welcome to our platform!"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
