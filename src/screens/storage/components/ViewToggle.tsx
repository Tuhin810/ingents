import React from "react";

export const ViewToggle: React.FC<{
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
}> = ({ view, setView }) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setView("grid")}
        className={`p-2 rounded-md ${
          view === "grid"
            ? "bg-blue-500 text-white"
            : "text-gray-600 hover:bg-gray-200"
        }`}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        onClick={() => setView("list")}
        className={`p-2 rounded-md ${
          view === "list"
            ? "bg-blue-500 text-white"
            : "text-gray-600 hover:bg-gray-200"
        }`}
        aria-pressed={view === "list"}
        aria-label="List view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ViewToggle;
