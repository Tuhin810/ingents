"use client";
import React from "react";
import Layout from "../layout/Layout";
import ModeToggle from "./components/ModeToggle";
import PreloadedGrid from "./components/PreloadedGrid";
import CreatePanel from "./components/CreatePanel";
import { FiChevronRight } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";

export const EmailTemplates = () => {
  const [mode, setMode] = React.useState<"preloaded" | "create">("preloaded");
  const router = useRouter();
  const params = useParams() as { site?: string } | null;

  const openCreatePage = () => {
    const site = params?.site;
    const target = site
      ? `/${site}/email-marketing/templates/create`
      : `/email-marketing/templates/create`;
    void router.push(target);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Email Templates
            </h1>
            <p className="text-sm text-gray-500">Create or choose a template</p>
          </div>

          <div className="flex items-center space-x-3">
            <ModeToggle mode={mode} onChange={(m) => setMode(m)} />

            <button
              onClick={openCreatePage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 text-sm"
            >
              <span>New template</span>
              <FiChevronRight />
            </button>
          </div>
        </div>

        {mode === "preloaded" ? <PreloadedGrid /> : <CreatePanel />}
      </div>
    </Layout>
  );
};
