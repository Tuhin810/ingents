import { useState, useCallback } from "react";
import { EmailComponent, ViewMode, ActiveTab } from "../types";

export const useEmailTemplateState = () => {
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("contents");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  const handleDrop = useCallback((newComponent: EmailComponent) => {
    setComponents((prev) => [...prev, newComponent]);
  }, []);

  const handleUpdateComponent = useCallback(
    (id: string, updates: Partial<EmailComponent>) => {
      setComponents((prev) =>
        prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp))
      );
    },
    []
  );

  const handleSelectComponent = useCallback((id: string) => {
    setSelectedComponent(id);
  }, []);

  const handleDeleteComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== id));
    setSelectedComponent(null);
  }, []);

  const handleReorderComponents = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setComponents((prev) => {
        const draggedComponent = prev[dragIndex];
        const newComponents = [...prev];
        newComponents.splice(dragIndex, 1);
        newComponents.splice(hoverIndex, 0, draggedComponent);
        return newComponents;
      });
    },
    []
  );

  const getSelectedComponent = useCallback(() => {
    return components.find((c) => c.id === selectedComponent) || null;
  }, [components, selectedComponent]);

  return {
    // State
    components,
    selectedComponent,
    activeTab,
    viewMode,

    // Actions
    handleDrop,
    handleUpdateComponent,
    handleSelectComponent,
    handleDeleteComponent,
    handleReorderComponents,
    setActiveTab,
    setViewMode,

    // Computed
    getSelectedComponent,
  };
};
