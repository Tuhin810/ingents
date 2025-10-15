import React from "react";
import { FiVideo, FiUpload } from "react-icons/fi";
import { EmailComponent } from "../types";
import { DEFAULT_COMPONENT_CONTENT, DEFAULT_STYLES } from "../constants";

interface ComponentRendererProps {
  component: EmailComponent;
  onUpdate: (id: string, updates: Partial<EmailComponent>) => void;
  isSelected: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  onUpdate,
  isSelected,
  fileInputRef,
  onImageUpload,
}) => {
  const handleContentChange = (newContent: string) => {
    onUpdate(component.id, { content: newContent });
  };

  const handleResize = (dimension: "width" | "height", value: number) => {
    onUpdate(component.id, {
      style: {
        ...component.style,
        [dimension]: `${value}px`,
      },
    });
  };

  switch (component.type) {
    case "title":
      return (
        <h2
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleContentChange(e.target.textContent || "")}
          className="outline-none"
          style={{
            color: component.style?.color || DEFAULT_STYLES.TITLE_COLOR,
            fontSize: component.style?.fontSize || "24px",
            fontFamily: component.style?.fontFamily || "Arial, sans-serif",
            fontWeight: component.style?.fontWeight || "bold",
            fontStyle: component.style?.fontStyle || "normal",
            textAlign: component.style?.textAlign || "left",
            textDecoration: component.style?.textDecoration || "none",
            backgroundColor: component.style?.backgroundColor || "transparent",
            lineHeight: component.style?.lineHeight || "1.2",
            padding:
              component.style?.backgroundColor !== "transparent" ? "8px" : "0",
            borderRadius:
              component.style?.backgroundColor !== "transparent" ? "4px" : "0",
          }}
        >
          {component.content || DEFAULT_COMPONENT_CONTENT.TITLE}
        </h2>
      );

    case "text":
      return (
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleContentChange(e.target.textContent || "")}
          className="outline-none"
          style={{
            color: component.style?.color || DEFAULT_STYLES.TEXT_COLOR,
            fontSize: component.style?.fontSize || "16px",
            fontFamily: component.style?.fontFamily || "Arial, sans-serif",
            fontWeight: component.style?.fontWeight || "normal",
            fontStyle: component.style?.fontStyle || "normal",
            textAlign: component.style?.textAlign || "left",
            textDecoration: component.style?.textDecoration || "none",
            backgroundColor: component.style?.backgroundColor || "transparent",
            lineHeight: component.style?.lineHeight || "1.5",
            padding:
              component.style?.backgroundColor !== "transparent" ? "8px" : "0",
            borderRadius:
              component.style?.backgroundColor !== "transparent" ? "4px" : "0",
          }}
        >
          {component.content || DEFAULT_COMPONENT_CONTENT.TEXT}
        </p>
      );

    case "photo":
      return (
        <div className="relative group">
          <img
            src={component.content || "https://via.placeholder.com/400x200"}
            alt="Email content"
            className="w-full h-auto rounded-lg"
            style={{
              maxHeight: component.style?.height || DEFAULT_STYLES.PHOTO_HEIGHT,
              width: component.style?.width || DEFAULT_STYLES.PHOTO_WIDTH,
              objectFit: "cover",
            }}
          />

          {/* Overlay with controls */}
          <div className="absolute inset-0 bg-black/50 bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-gray-700 px-3 py-1 rounded-md text-sm flex items-center gap-2"
            >
              <FiUpload className="w-4 h-4" />
              Change Image
            </button>
          </div>

          {/* Resize handles - only show when selected */}
          {isSelected && (
            <>
              <ResizeHandle
                position="bottom-right"
                onResize={(deltaX, deltaY) => {
                  const startWidth = parseInt(component.style?.width || "400");
                  const startHeight = parseInt(
                    component.style?.height || "300"
                  );
                  handleResize("width", Math.max(100, startWidth + deltaX));
                  handleResize(
                    "height",
                    Math.max(100, startHeight + (deltaY || 0))
                  );
                }}
              />
              <ResizeHandle
                position="right"
                onResize={(deltaX) => {
                  const startWidth = parseInt(component.style?.width || "400");
                  handleResize("width", Math.max(100, startWidth + deltaX));
                }}
              />
              <ResizeHandle
                position="bottom"
                onResize={(_, deltaY) => {
                  const startHeight = parseInt(
                    component.style?.height || "300"
                  );
                  handleResize(
                    "height",
                    Math.max(100, startHeight + (deltaY || 0))
                  );
                }}
              />
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
        </div>
      );

    case "button":
      return (
        <button
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleContentChange(e.target.textContent || "")}
          className="px-6 py-3 rounded-lg font-medium transition-colors outline-none"
          style={{
            backgroundColor:
              component.style?.backgroundColor || DEFAULT_STYLES.BUTTON_BG,
            color: component.style?.color || DEFAULT_STYLES.BUTTON_COLOR,
          }}
        >
          {component.content || DEFAULT_COMPONENT_CONTENT.BUTTON}
        </button>
      );

    case "video":
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <FiVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Click to add video</p>
        </div>
      );

    case "table":
      return (
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-3 bg-blue-50">
                Privacy Policy
              </td>
              <td className="border border-gray-300 p-3 bg-green-50">
                Terms & conditions
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-sm text-gray-600">
                Artiflow is a creative agency based in Sydney. Specialty...
              </td>
              <td className="border border-gray-300 p-2 text-sm text-gray-600">
                Artiflow is a creative agency based in Sydney. Specialty...
              </td>
            </tr>
          </tbody>
        </table>
      );

    case "divider":
      return (
        <hr
          className="border-0 h-px my-4"
          style={{
            backgroundColor:
              component.style?.color || DEFAULT_STYLES.DIVIDER_COLOR,
            height: component.style?.height || "1px",
          }}
        />
      );

    case "quote":
      return (
        <blockquote
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleContentChange(e.target.textContent || "")}
          className="border-l-4 border-blue-500 pl-4 outline-none"
          style={{
            color: component.style?.color || "#6b7280",
            fontSize: component.style?.fontSize || "16px",
            fontFamily: component.style?.fontFamily || "Arial, sans-serif",
            fontWeight: component.style?.fontWeight || "normal",
            fontStyle: component.style?.fontStyle || "italic",
            textAlign: component.style?.textAlign || "left",
            textDecoration: component.style?.textDecoration || "none",
            backgroundColor: component.style?.backgroundColor || "transparent",
            lineHeight: component.style?.lineHeight || "1.5",
            padding:
              component.style?.backgroundColor !== "transparent"
                ? "12px 12px 12px 16px"
                : "0 0 0 16px",
            borderRadius:
              component.style?.backgroundColor !== "transparent" ? "4px" : "0",
            marginLeft:
              component.style?.backgroundColor !== "transparent" ? "4px" : "0",
          }}
        >
          {component.content || DEFAULT_COMPONENT_CONTENT.QUOTE}
        </blockquote>
      );

    case "signature":
      return (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange(e.target.innerHTML)}
            className="text-sm text-gray-600 outline-none"
            dangerouslySetInnerHTML={{
              __html: component.content || DEFAULT_COMPONENT_CONTENT.SIGNATURE,
            }}
          />
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-100 rounded text-center text-gray-500">
          Unknown component type
        </div>
      );
  }
};

// Resize handle component
interface ResizeHandleProps {
  position: "bottom-right" | "right" | "bottom";
  onResize: (deltaX: number, deltaY?: number) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onResize }) => {
  const getClassName = () => {
    switch (position) {
      case "bottom-right":
        return "absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-75 hover:opacity-100";
      case "right":
        return "absolute top-1/2 right-0 w-2 h-8 bg-blue-500 cursor-e-resize opacity-75 hover:opacity-100 transform -translate-y-1/2";
      case "bottom":
        return "absolute bottom-0 left-1/2 w-8 h-2 bg-blue-500 cursor-s-resize opacity-75 hover:opacity-100 transform -translate-x-1/2";
      default:
        return "";
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (position === "right") {
        onResize(deltaX);
      } else if (position === "bottom") {
        onResize(0, deltaY);
      } else {
        onResize(deltaX, deltaY);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return <div className={getClassName()} onMouseDown={handleMouseDown}></div>;
};
