"use client";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  LeftSidebar,
  TopToolbar,
  EmailCanvas,
  RightSidebar,
} from "./components";
import { useEmailTemplateState } from "./hooks";

export const EmailTemplateMaker = () => {
  const {
    components,
    selectedComponent,
    activeTab,
    viewMode,
    handleDrop,
    handleUpdateComponent,
    handleSelectComponent,
    handleDeleteComponent,
    handleReorderComponents,
    setActiveTab,
    setViewMode,
    getSelectedComponent,
  } = useEmailTemplateState();

  const selectedComponentData = getSelectedComponent();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex -mt-8">
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <TopToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

          {/* Canvas */}
          <div className="flex-1 p-6">
            <div
              className={`mx-auto transition-all duration-300 ${
                viewMode === "mobile" ? "max-w-sm" : "max-w-2xl"
              }`}
            >
              <EmailCanvas
                components={components}
                onDrop={handleDrop}
                onUpdateComponent={handleUpdateComponent}
                onDeleteComponent={handleDeleteComponent}
                onReorderComponents={handleReorderComponents}
                selectedComponent={selectedComponent}
                onSelectComponent={handleSelectComponent}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {selectedComponentData && (
          <RightSidebar
            component={selectedComponentData}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
          />
        )}
      </div>
    </DndProvider>
  );
};
