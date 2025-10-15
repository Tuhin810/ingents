/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import AuthContext from "@/contexts/authContext/authContext";
import { generateLumaVideoFromText } from "@/service/luma";

import { useContext, useEffect, useState } from "react";

export default function FacebookPostForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const [pageId, setPageId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (user) {
      setPageId(user.facebook?.project_id ?? "");
      setUserId(user.id ?? "");
    } else {
      setPageId("");
      setUserId("");
    }
  }, [user]);
  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          const msg = String(fd.get("message") ?? "").trim();
          if (!msg) return;

          setLoading(true);
          setResult(null);

          try {
            const res = generateLumaVideoFromText(msg);
            console.log(res);
          } catch (err: any) {
            setResult("Failed: " + (err.message || "Unknown error"));
          } finally {
            (e.currentTarget as HTMLFormElement).reset();
            setLoading(false);
          }
        }}
        className="mt-6 flex items-center gap-3"
      >
        <input
          name="message"
          type="text"
          placeholder="Write a message..."
          aria-label="Message input"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Posting..." : "Send"}
        </button>

        {result && (
          <p className="ml-4 text-sm text-gray-600 whitespace-nowrap">
            {result}
          </p>
        )}
      </form>

      <button
        onClick={() => {
          localStorage.setItem(
            "companyDetails",
            JSON.stringify({
              name: "AstraNova Technologies",
              industry: "AI and Automation Solutions",
              description:
                "We build intelligent automation tools that help businesses streamline operations and enhance productivity using cutting-edge AI models.",
              tone: "professional yet friendly",
              audience:
                "tech enthusiasts, startups, and innovation-driven companies",
              values: ["innovation", "efficiency", "transparency"],
              website: "https://www.astranova.tech",
              brandKeywords: [
                "AI",
                "automation",
                "future of work",
                "efficiency",
                "smart tech",
              ],
            })
          );
        }}
      >
        Set Data
      </button>
    </div>
  );
}
