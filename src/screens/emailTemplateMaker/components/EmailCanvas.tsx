import React from "react";
import { useDrop } from "react-dnd";
import { FiGrid, FiSquare } from "react-icons/fi";
import { ComponentTypes } from "../constants";
import {
  EmailCanvasProps,
  DragItem,
  EmailComponent as EmailComponentType,
} from "../types";
import { EmailComponent } from "./EmailComponent";

export const EmailCanvas: React.FC<EmailCanvasProps> = ({
  components,
  onDrop,
  onUpdateComponent,
  onDeleteComponent,
  onReorderComponents,
  selectedComponent,
  onSelectComponent,
  viewMode,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      ComponentTypes.REORDER,
      ...Object.values(ComponentTypes).filter(
        (type) => type !== ComponentTypes.REORDER
      ),
    ],
    drop: (item: DragItem) => {
      const newComponent: EmailComponentType = {
        id: Date.now().toString(),
        type: item.type,
        content: "",
        style: {},
      };
      onDrop(newComponent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as any}
      className={`min-h-[600px] bg-white rounded-lg shadow-sm border-2 border-dashed transition-colors ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
      }`}
    >
      {/* Email Header */}
      <div className="bg-gray-700 text-white p-4 rounded-t-lg flex items-center">
        <div className="w-8 h-8 bg-gray-500 rounded-full mr-3 flex items-center justify-center">
          <span className="text-sm font-bold">A</span>
        </div>
        <div className="ml-auto flex space-x-2">
          <FiSquare className="w-4 h-4" />
          <FiSquare className="w-4 h-4" />
          <FiSquare className="w-4 h-4" />
        </div>
      </div>

      {/* Email Content */}
      <div className={`space-y-6 ${viewMode === "mobile" ? "p-3" : "p-6"}`}>
        {components.length === 0 ? (
          <div className="text-center py-12">
            <FiGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Drag and drop components here to start building your email
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Currently viewing in {viewMode} mode
            </p>
          </div>
        ) : (
          components.map((component, index) => (
            <EmailComponent
              key={component.id}
              component={component}
              index={index}
              onUpdate={onUpdateComponent}
              onSelect={onSelectComponent}
              onDelete={onDeleteComponent}
              onReorder={onReorderComponents}
              isSelected={selectedComponent === component.id}
            />
          ))
        )}
      </div>
    </div>
  );
};
