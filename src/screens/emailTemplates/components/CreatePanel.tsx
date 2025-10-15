"use client";
import React, { useEffect, useRef, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import {
  BiBold,
  BiItalic,
  BiUnderline,
  BiListUl,
  BiListOl,
  BiLink,
  BiImage,
  BiUndo,
  BiRedo,
  BiHeading,
} from "react-icons/bi";

function ToolbarIcon({ onClick, active, children, title }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md text-sm flex items-center justify-center ${
        active ? "bg-gray-200" : "bg-white"
      } border`}
    >
      {children}
    </button>
  );
}

export default function CreatePanel() {
  const router = useRouter();
  const params = useParams() as { site?: string } | null;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  const openCreatePage = () => {
    const site = params?.site;
    const target = site
      ? `/${site}/email-marketing/templates/create`
      : `/email-marketing/templates/create`;
    void router.push(target);
  };

  useEffect(() => {
    const onSel = () => {
      const cmds = [
        "bold",
        "italic",
        "underline",
        "insertUnorderedList",
        "insertOrderedList",
      ];
      const map: Record<string, boolean> = {};
      cmds.forEach((c) => {
        try {
          // @ts-ignore
          map[c] = document.queryCommandState(c);
        } catch {
          map[c] = false;
        }
      });
      setActive(map);
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const exec = (cmd: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    try {
      // @ts-ignore
      document.execCommand(cmd, false, value ?? undefined);
      const isActive = () => {
        try {
          // @ts-ignore
          return document.queryCommandState(cmd);
        } catch {
          return false;
        }
      };
      setActive((s) => ({ ...s, [cmd]: isActive() }));
    } catch (e) {
      console.warn("exec command failed", cmd, e);
    }
  };

  const insertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const url = e.target?.result as string;
      exec("insertImage", url);
    };
    reader.readAsDataURL(file);
  };

  const onPickImage = () => fileInputRef.current?.click();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Create your own template
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Start from scratch or choose a layout.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewOpen(true)}
            className="text-sm px-5 py-2 rounded-full bg-gray-800 text-white"
          >
            Preview
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-50 rounded-md p-4">
          <label className="block text-sm text-gray-700">Template name</label>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full mt-2 p-2 border border-gray-200 rounded-2xl bg-white"
            placeholder="My New Template"
          />

          <label className="block text-sm text-gray-700 mt-4">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full mt-2 p-2 border border-gray-200 rounded-2xl bg-white"
            placeholder="Your subject line"
          />

          {/* Toolbar */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <ToolbarIcon
              onClick={() => exec("bold")}
              active={active.bold}
              title="Bold"
            >
              <BiBold />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={() => exec("italic")}
              active={active.italic}
              title="Italic"
            >
              <BiItalic />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={() => exec("underline")}
              active={active.underline}
              title="Underline"
            >
              <BiUnderline />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={() => exec("formatBlock", "H1")}
              active={false}
              title="Heading"
            >
              <BiHeading />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={() => exec("insertUnorderedList")}
              active={active.insertUnorderedList}
              title="Bulleted list"
            >
              <BiListUl />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={() => exec("insertOrderedList")}
              active={active.insertOrderedList}
              title="Numbered list"
            >
              <BiListOl />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={() => {
                const url = prompt("Enter URL (include https://)");
                if (url) exec("createLink", url);
              }}
              active={false}
              title="Insert link"
            >
              <BiLink />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={onPickImage}
              active={false}
              title="Insert image"
            >
              <BiImage />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={() => exec("undo")}
              active={false}
              title="Undo"
            >
              <BiUndo />
            </ToolbarIcon>
            <ToolbarIcon
              onClick={() => exec("redo")}
              active={false}
              title="Redo"
            >
              <BiRedo />
            </ToolbarIcon>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) insertImage(f);
              e.currentTarget.value = "";
            }}
          />

          {/* Editor */}
          <div
            ref={editorRef}
            id="email-editor"
            contentEditable
            suppressContentEditableWarning
            className="min-h-[320px] border border-gray-200 rounded-md p-4 bg-white text-sm text-gray-800 focus:outline-none mt-4"
          >
            <h3 style={{ margin: 0 }}>Hello,</h3>
            <p style={{ marginTop: 8 }}>Start writing your email here...</p>
          </div>

          <div className="mt-3 flex items-center space-x-3">
            <button
              onClick={() => {
                const html = editorRef.current?.innerHTML || "";
                console.log("Draft saved", { templateName, subject, html });
              }}
              className="px-4 py-2 rounded-md bg-gray-200 text-sm"
            >
              Save draft
            </button>
            <button
              onClick={() => {
                const html = editorRef.current?.innerHTML || "";
                console.log("Send email", { templateName, subject, html });
              }}
              className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm"
            >
              Send
            </button>
          </div>
        </div>

        <aside className="bg-white rounded-md p-4 shadow-sm">
          <div className="mt-6">
            <button
              onClick={openCreatePage}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-full flex items-center justify-center space-x-2"
            >
              <span>Open full editor</span>
              <FiChevronRight />
            </button>
          </div>
        </aside>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md max-w-3xl w-full p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview</h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-sm px-3 py-1 border rounded-md"
              >
                Close
              </button>
            </div>
            <div className="border rounded-md p-4 max-h-[60vh] overflow-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: editorRef.current?.innerHTML || "",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
