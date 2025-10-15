"use client";
import React, { useEffect, useRef, useState } from "react";
import type { RecentFile } from "./types";
import { CloudUpload } from "lucide-react";

const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];

function getFileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : u.hostname;
  } catch {
    return url;
  }
}

function getExt(nameOrUrl: string) {
  const m = nameOrUrl.split("?")[0].split("/").pop();
  if (!m) return "";
  const seg = m.split(".");
  return seg.length > 1 ? seg[seg.length - 1].toLowerCase() : "";
}

export const UploadSidebar = () => {
  const [list, setList] = useState<RecentFile[]>([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "download">("upload");
  const [progressItems, setProgressItems] = useState<{ [key: string]: number }>(
    {}
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    // Clear localStorage to start fresh (remove this if you want to keep stored data)
    if (typeof window !== "undefined") {
      localStorage.removeItem("storage_files");
    }
  }, []);

  // persist list (only remote items) to localStorage
  useEffect(() => {
    try {
      const toPersist = list.filter((f) => !f.isLocal);
      localStorage.setItem("storage_files", JSON.stringify(toPersist));
    } catch {
      // ignore
    }
  }, [list]);

  // cleanup object URLs on unmount by tracking created object URLs
  const createdObjectUrls = useRef<string[]>([]);
  useEffect(() => {
    const snapshot = createdObjectUrls.current.slice();
    return () => {
      snapshot.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
  }, []);

  const handleAdd = () => {
    setError(null);
    if (!url) {
      setError("Please enter an image URL");
      return;
    }

    try {
      // Basic validation
      new URL(url);
    } catch {
      setError("Invalid URL");
      return;
    }

    const name = getFileNameFromUrl(url);
    const ext = getExt(name);
    const isImg = imageExtensions.includes(ext);
    const id = Date.now().toString();

    const newFile: RecentFile = {
      id,
      name,
      date: new Date().toLocaleDateString(),
      size: "-",
      type: isImg ? "img" : ext || "file",
      color: isImg ? "bg-indigo-500" : "bg-gray-500",
      preview: isImg ? url : undefined,
      isLocal: false,
    };

    setList((s) => [newFile, ...s].slice(0, 20));

    // Start progress animation
    setProgressItems((prev) => ({ ...prev, [id]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        setProgressItems((prev) => ({ ...prev, [id]: 100 }));
        clearInterval(interval);
        setTimeout(() => {
          setProgressItems((prev) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: _, ...rest } = prev;
            return rest;
          });
        }, 1000);
      } else {
        setProgressItems((prev) => ({ ...prev, [id]: progress }));
      }
    }, 200);

    setUrl("");
  };

  const handleFileInput = (filesInput?: FileList | null) => {
    const f = filesInput?.[0];
    if (!f) return;
    const objectUrl = URL.createObjectURL(f);
    createdObjectUrls.current.push(objectUrl);
    const id = Date.now().toString();

    const newFile: RecentFile = {
      id,
      name: f.name,
      date: new Date().toLocaleDateString(),
      size: `${Math.round(f.size / 1024)} KB`,
      type: (f.name.split(".").pop() || "file").toLowerCase(),
      color: "bg-indigo-500",
      preview: objectUrl,
      isLocal: true,
    };

    setList((s) => [newFile, ...s].slice(0, 20));

    // Start progress animation
    setProgressItems((prev) => ({ ...prev, [id]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        setProgressItems((prev) => ({ ...prev, [id]: 100 }));
        clearInterval(interval);
        setTimeout(() => {
          setProgressItems((prev) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: removed, ...rest } = prev;
            return rest;
          });
        }, 1000);
      } else {
        setProgressItems((prev) => ({ ...prev, [id]: progress }));
      }
    }, 200);
  };

  const triggerFilePicker = () => {
    if (!inputRef.current) return;
    inputRef.current.click();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <div
          role="tablist"
          aria-label="Upload or download"
          className="inline-flex bg-gray-100 p-1 rounded-full w-full"
        >
          <button
            role="tab"
            aria-selected={activeTab === "upload"}
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-2 rounded-full w-1/2 transition-all text-sm font-medium ${
              activeTab === "upload"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Upload
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "download"}
            onClick={() => setActiveTab("download")}
            className={`px-6 py-2 rounded-full w-1/2 transition-all text-sm font-medium ${
              activeTab === "download"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Download
          </button>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") triggerFilePicker();
        }}
        onClick={() => triggerFilePicker()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileInput(e.dataTransfer?.files ?? null);
        }}
        className="border-2 border-dashed border-blue-200 bg-gray-100 rounded-xl p-4 mb-6 text-center relative cursor-pointer"
      >
        <div className="flex flex-col items-center gap-3">
          <CloudUpload className="text-blue-500 w-12 h-12" />
          <p className="text-gray-600 mb-0">
            Drag & drop or click to choose files
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: PNG, JPG, SVG, GIF
          </p>
          <p className="text-xs text-gray-400">Max: 25MB</p>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add image URL
        </label>
        <div className="flex space-x-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-gradient-to-r from-purple-500/80 to-indigo-500/90 text-white text-sm rounded-full hover:bg-blue-700"
          >
            Upload
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileInput(e.target.files)}
      />

      <div className="space-y-4 mb-6">
        {list.map((f) => {
          const progress = progressItems[f.id];
          const isUploading = progress !== undefined;
          return (
            <div
              key={f.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              {/** If this file looks like an image show a small thumbnail only after upload completes */}
              {imageExtensions.includes(getExt(f.name)) || f.type === "img" ? (
                <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                  {/* Show image thumbnail only when upload is complete (no progress) */}
                  {f.type === "img" && f.preview && !isUploading ? (
                    <img
                      src={f.preview}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gray-300 rounded flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {f.type.toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-xs font-bold`}
                >
                  {f.type.toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{f.name}</span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() =>
                      setList((s) => s.filter((it) => it.id !== f.id))
                    }
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-gray-500 mb-1">{f.size}</div>
                {/* Show progress bar only when uploading, hide when complete */}
                {isUploading ? (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                ) : null}
              </div>
              {isUploading ? (
                <span className="text-xs text-gray-500">
                  {Math.round(progress)}%
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UploadSidebar;
