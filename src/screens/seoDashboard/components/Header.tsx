/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { MoveUpRight } from "lucide-react";
import React, { useCallback, useState } from "react";
import DomainDropdown from "./DomainDropdown";
import DomainStatsBar from "./DomainStatsBar";

interface DomainData {
  id: string;
  name: string;
  url: string;
  isLive: boolean;
  logo?: string;
  lastChecked: string;
}

export const Header = ({ seoResult }: { seoResult?: unknown } = {}) => {
  const [connectedDomains, setConnectedDomains] = useState<DomainData[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [selectedDomain, setSelectedDomain] = useState<DomainData | null>(
    connectedDomains[0] ?? null
  );
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [newDomainUrl, setNewDomainUrl] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleConnectDomain = (url?: string) => {
    const domainUrl = url ?? newDomainUrl;
    if (domainUrl) {
      // Try to fetch metadata from the server
      (async () => {
        try {
          const res = await fetch(
            `/api/metadata?url=${encodeURIComponent(domainUrl)}`
          );
          const data = await res.json();

          const logo = data.favicon || data.ogImage || "🌐";
          const name = data.title || data.name || new URL(domainUrl).hostname;

          const newDomain: DomainData = {
            id: Date.now().toString(),
            name,
            url: domainUrl,
            isLive: Math.random() > 0.3, // Random live status for demo
            logo,
            lastChecked: "Just now",
          };

          setConnectedDomains((prev) => {
            const next = [...prev, newDomain];
            // Immediately select the newly added domain so the header shows the name/logo
            setSelectedDomain(newDomain);
            return next;
          });
        } catch (_err) {
          void _err;
          const newDomain: DomainData = {
            id: Date.now().toString(),
            name: new URL(domainUrl).hostname,
            url: domainUrl,
            isLive: Math.random() > 0.3, // Random live status for demo
            logo: "🌐",
            lastChecked: "Just now",
          };

          setConnectedDomains((prev) => {
            const next = [...prev, newDomain];
            setSelectedDomain(newDomain);
            return next;
          });
        } finally {
          setNewDomainUrl("");
          setShowDomainModal(false);
        }
      })();
    }
  };

  const handleGenerateSEO = useCallback(async () => {
    if (!selectedDomain?.url) {
      console.error("No domain selected");
      return;
    }
    if (!keyword.trim()) {
      console.error("No keyword provided");
      return;
    }

    const body = {
      target_url: selectedDomain.url,
      main_keyword: keyword,
    };

    console.log("Sending API request with:", body);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.text();
      // try parse JSON, otherwise keep text
      let parsed: unknown = data;
      try {
        parsed = JSON.parse(data);
      } catch {
        // leave as text
      }
      console.log("API response:", {
        status: res.status,
        ok: res.ok,
        body: parsed,
      });
      const final = { status: res.status, ok: res.ok, body: parsed };
      try {
        localStorage.setItem("seo_result", JSON.stringify(final));
        // use app-router navigation
        // router.push("/result");
      } catch (err) {
        console.error("Failed to persist seo_result:", err);
      }
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, keyword]);

  const handleRemoveDomain = (id: string) => {
    setConnectedDomains((prev) => prev.filter((d) => d.id !== id));
    setSelectedDomain((prev) => (prev && prev.id === id ? null : prev));
  };

  // On mount, try to fetch metadata (favicon/title) for any domains without a logo
  React.useEffect(() => {
    (async () => {
      const pending = connectedDomains.filter((d) => !d.logo);
      if (pending.length === 0) return;

      const updated = [...connectedDomains];
      await Promise.all(
        pending.map(async (domain) => {
          try {
            const res = await fetch(
              `/api/metadata?url=${encodeURIComponent(domain.url)}`
            );
            const data = await res.json();
            const logo = data.favicon || data.ogImage || "";
            const name = data.title || data.name || domain.name;
            const idx = updated.findIndex((u) => u.id === domain.id);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], logo, name };
            }
          } catch (_e) {
            void _e;
          }
        })
      );

      setConnectedDomains(updated);
      // ensure selected domain is updated if it existed; otherwise pick first or null
      setSelectedDomain((prev) => {
        const found = prev ? updated.find((d) => d.id === prev.id) : undefined;
        return found ?? updated[0] ?? null;
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="pt-4 mb-6 ">
        <div className="flex items-center justify-between">
          {/* Domain Selection */}
          <div className="flex items-center space-x-4">
            <DomainDropdown
              domains={connectedDomains}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              open={showDomainModal}
              onOpen={setShowDomainModal}
              onSelect={setSelectedDomain}
              onAddDomain={handleConnectDomain}
              onRemoveDomain={handleRemoveDomain}
              newDomainUrl={newDomainUrl}
              setNewDomainUrl={setNewDomainUrl}
            />
          </div>

          {/* Dashboard Actions */}
          <div className="flex items-center space-x-4">
            {/* WP Admin Button */}
            <button className="flex items-center space-x-2 bg-white hover:bg-gray-200 border border-gray-200 rounded-full px-4 py-2 transition-colors">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21.469 6.825c.84 1.537.84 3.413 0 4.95l-3.469 6.343c-.84 1.537-2.394 2.482-4.094 2.482H9.094c-1.7 0-3.254-.945-4.094-2.482L1.531 11.775c-.84-1.537-.84-3.413 0-4.95L5 .482C5.84-1.055 7.394-2 9.094-2h4.812c1.7 0 3.254.945 4.094 2.482L21.469 6.825z" />
                </svg>
              </div>
              <span className="text-gray-800 text-sm font-medium">
                WP Admin
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </button>

            {/* External Link Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg
                className="w-5 h-5 text-gray-500 hover:text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 ">
        <div className="w-[70%]">
          <label className="text-ms font-semibold text-gray-700 mb-2 block">
            Test with keywords
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="eg: Ai Development company"
              className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-3 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleGenerateSEO}
              disabled={loading || !selectedDomain?.url || !keyword.trim()}
              className="bg-purple-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full text-sm font-medium transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MoveUpRight />
              )}
            </button>
          </div>
        </div>

        <DomainStatsBar
          seoResult={seoResult}
          lastCheckedText={selectedDomain?.lastChecked ?? "—"}
        />
      </div>
    </>
  );
};

export default Header;
