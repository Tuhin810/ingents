import React from "react";
import { useDrag } from "react-dnd";
import { ComponentTypes } from "../constants";
import { ComponentItemProps } from "../types";

export const DraggableItem: React.FC<ComponentItemProps> = ({
  type,
  icon: Icon,
  label,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ComponentTypes[type.toUpperCase() as keyof typeof ComponentTypes],
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`flex items-center p-3 rounded-lg border cursor-move transition-all ${
        isDragging
          ? "opacity-50 bg-blue-50 border-blue-300"
          : "bg-white hover:bg-gray-50 border-gray-200"
      }`}
    >
      <Icon className="w-4 h-4 text-gray-600 mr-3" />
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
};
