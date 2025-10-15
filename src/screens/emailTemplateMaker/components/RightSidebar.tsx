import React from "react";
import {
  FiTrash2,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiUnderline,
} from "react-icons/fi";
import { EmailComponent } from "../types";

interface RightSidebarProps {
  component: EmailComponent | null;
  onUpdateComponent: (id: string, updates: Partial<EmailComponent>) => void;
  onDeleteComponent: (id: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  component,
  onUpdateComponent,
  onDeleteComponent,
}) => {
  if (!component) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Component Properties
      </h3>
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Text Formatting Controls - Only for text components */}
        {(component.type === "title" ||
          component.type === "text" ||
          component.type === "quote") && (
          <>
            {/* Preset Styles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Styles
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        fontSize: component.type === "title" ? "32px" : "18px",
                        fontWeight: "bold",
                        color: "#1f2937",
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Header
                </button>
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        fontSize: "14px",
                        fontWeight: "normal",
                        color: "#6b7280",
                        fontStyle: "italic",
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Subtitle
                </button>
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        fontSize: "16px",
                        fontWeight: "normal",
                        color: "#374151",
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Body
                </button>
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        fontSize: "12px",
                        fontWeight: "normal",
                        color: "#9ca3af",
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Caption
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4"></div>
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <select
                value={
                  component.style?.fontSize ||
                  (component.type === "title" ? "24px" : "16px")
                }
                onChange={(e) =>
                  onUpdateComponent(component.id, {
                    style: { ...component.style, fontSize: e.target.value },
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="12px">12px - Small</option>
                <option value="14px">14px - Normal</option>
                <option value="16px">16px - Medium</option>
                <option value="18px">18px - Large</option>
                <option value="20px">20px - Extra Large</option>
                <option value="24px">24px - Title</option>
                <option value="28px">28px - Big Title</option>
                <option value="32px">32px - Huge</option>
              </select>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={component.style?.fontFamily || "Arial, sans-serif"}
                onChange={(e) =>
                  onUpdateComponent(component.id, {
                    style: { ...component.style, fontFamily: e.target.value },
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">
                  Times New Roman
                </option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Tahoma, sans-serif">Tahoma</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              </select>
            </div>

            {/* Font Weight & Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        fontWeight:
                          component.style?.fontWeight === "bold"
                            ? "normal"
                            : "bold",
                      },
                    })
                  }
                  className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center gap-1 transition-colors ${
                    component.style?.fontWeight === "bold"
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiBold className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        fontStyle:
                          component.style?.fontStyle === "italic"
                            ? "normal"
                            : "italic",
                      },
                    })
                  }
                  className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center gap-1 transition-colors ${
                    component.style?.fontStyle === "italic"
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiItalic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const currentDecoration =
                      component.style?.textDecoration || "none";
                    const newDecoration =
                      currentDecoration === "underline" ? "none" : "underline";
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        textDecoration: newDecoration,
                      },
                    });
                  }}
                  className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center gap-1 transition-colors ${
                    component.style?.textDecoration === "underline"
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiUnderline className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: { ...component.style, textAlign: "left" },
                    })
                  }
                  className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center transition-colors ${
                    (component.style?.textAlign || "left") === "left"
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiAlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: { ...component.style, textAlign: "center" },
                    })
                  }
                  className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center transition-colors ${
                    component.style?.textAlign === "center"
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiAlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: { ...component.style, textAlign: "right" },
                    })
                  }
                  className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center transition-colors ${
                    component.style?.textAlign === "right"
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiAlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Background Color for text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={component.style?.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        backgroundColor: e.target.value,
                      },
                    })
                  }
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() =>
                    onUpdateComponent(component.id, {
                      style: {
                        ...component.style,
                        backgroundColor: "transparent",
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Height
              </label>
              <select
                value={component.style?.lineHeight || "1.5"}
                onChange={(e) =>
                  onUpdateComponent(component.id, {
                    style: { ...component.style, lineHeight: e.target.value },
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="1">1 - Tight</option>
                <option value="1.2">1.2 - Snug</option>
                <option value="1.5">1.5 - Normal</option>
                <option value="1.75">1.75 - Relaxed</option>
                <option value="2">2 - Loose</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4"></div>
          </>
        )}

        {/* Text color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Color
          </label>
          <input
            type="color"
            value={component.style?.color || "#000000"}
            onChange={(e) =>
              onUpdateComponent(component.id, {
                style: { ...component.style, color: e.target.value },
              })
            }
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>

        {/* Background color for buttons */}
        {component.type === "button" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <input
              type="color"
              value={component.style?.backgroundColor || "#3b82f6"}
              onChange={(e) =>
                onUpdateComponent(component.id, {
                  style: {
                    ...component.style,
                    backgroundColor: e.target.value,
                  },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
        )}

        {/* Image properties */}
        {component.type === "photo" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={component.content}
              onChange={(e) =>
                onUpdateComponent(component.id, {
                  content: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Or click "Change Image" on the component to upload
            </p>
          </div>
        )}

        {/* Delete button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onDeleteComponent(component.id)}
            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete Component
          </button>
        </div>
      </div>
    </div>
  );
};
