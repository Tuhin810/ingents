"use client";
import React, { useState } from "react";
import FolderCard from "./components/FolderCard";
import FileCard from "./components/FileCard";
import FileListItem from "./components/FileListItem";
import ViewToggle from "./components/ViewToggle";
import UploadSidebar from "./components/UploadSidebar";
import type { Folder, RecentFile } from "./components/types";

const folders: Folder[] = [
  {
    id: "1",
    name: "UI Design",
    items: 5,
    size: "1.2 GB",
    color: "bg-yellow-400",
  },
  {
    id: "2",
    name: "UX Design",
    items: 5,
    size: "1.2 GB",
    color: "bg-yellow-400",
  },
  { id: "3", name: "Career", items: 3, size: "1.2 GB", color: "bg-yellow-400" },
  { id: "4", name: "Resume", items: 5, size: "1.2 GB", color: "bg-yellow-400" },
  {
    id: "5",
    name: "UI Design",
    items: 5,
    size: "1.2 GB",
    color: "bg-yellow-400",
  },
];

const recentFiles: RecentFile[] = [
  {
    id: "1",
    name: "Project_Design.pdf",
    date: "15 Mar 2025",
    size: "2.3 MB",
    type: "pdf",
    color: "bg-red-500",
  },
  {
    id: "2",
    name: "UX_Wireframe.fig",
    date: "12 Mar 2025",
    size: "4.8 MB",
    type: "fig",
    color: "bg-gray-800",
  },
  {
    id: "3",
    name: "Final_Report.docx",
    date: "12 Mar 2025",
    size: "1.5 MB",
    type: "doc",
    color: "bg-blue-500",
  },
  {
    id: "4",
    name: "Team_Photo.jpg",
    date: "08 Mar 2025",
    size: "3.2 MB",
    type: "jpg",
    color: "bg-orange-500",
  },
  {
    id: "5",
    name: "Marketing_Plan.xlsx",
    date: "07 Mar 2025",
    size: "5.1 MB",
    type: "xls",
    color: "bg-green-600",
  },
];

export const StorageDashbaord: React.FC = () => {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className=" p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Folders</h2>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  View all
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Files
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Filter</span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    View all
                  </button>
                  <ViewToggle view={view} setView={setView} />
                </div>
              </div>

              {view === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {recentFiles.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {recentFiles.map((file) => (
                      <FileListItem key={file.id} file={file} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <UploadSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDashbaord;
