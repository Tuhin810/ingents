import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { FiGrid, FiEdit3, FiTrash2 } from "react-icons/fi";
import { ComponentTypes } from "../constants";
import { EmailComponentProps } from "../types";
import { ComponentRenderer } from "./ComponentRenderer";

export const EmailComponent: React.FC<EmailComponentProps> = ({
  component,
  index,
  onUpdate,
  onSelect,
  onDelete,
  onReorder,
  isSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Drag and drop for reordering
  const [{ handlerId }, drop] = useDrop({
    accept: ComponentTypes.REORDER,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onReorder(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ComponentTypes.REORDER,
    item: () => {
      return { id: component.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onUpdate(component.id, { content: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      onClick={() => onSelect(component.id)}
      className={`relative group ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } hover:ring-1 hover:ring-gray-300 rounded-lg p-2 transition-all cursor-move`}
    >
      {/* Drag handle */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-gray-400 hover:bg-gray-600 rounded cursor-move p-1">
          <FiGrid className="w-3 h-3 text-white" />
        </div>
      </div>

      <ComponentRenderer
        component={component}
        onUpdate={onUpdate}
        isSelected={isSelected}
        fileInputRef={fileInputRef}
        onImageUpload={handleImageUpload}
      />

      {isSelected && (
        <>
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            <FiEdit3 className="w-3 h-3" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
            className="absolute -top-2 -right-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          >
            <FiTrash2 className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
};
