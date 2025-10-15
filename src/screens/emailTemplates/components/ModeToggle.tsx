"use client";
import React from "react";

type Props = {
  mode: "preloaded" | "create";
  onChange: (m: "preloaded" | "create") => void;
};

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="bg-gray-100 rounded-full p-1 flex items-center">
      <button
        onClick={() => onChange("preloaded")}
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          mode === "preloaded" ? "bg-white shadow text-gray-800" : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Use preloaded
      </button>
      <button
        onClick={() => onChange("create")}
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          mode === "create" ? "bg-white shadow text-gray-800" : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Create own
      </button>
    </div>
  );
}
