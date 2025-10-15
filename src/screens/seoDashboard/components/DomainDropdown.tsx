/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import DomainListItem from "./DomainListItem";
import Image from "next/image";

interface DomainData {
  id: string;
  name: string;
  url: string;
  isLive: boolean;
  logo?: string;
  lastChecked: string;
}

interface Props {
  domains: DomainData[];
  selectedDomain?: DomainData | null;
  open: boolean;
  onOpen: (v: boolean) => void;
  onSelect: (d: DomainData) => void;
  onAddDomain: (url: string) => void;
  newDomainUrl: string;
  setNewDomainUrl: (v: string) => void;
  setSelectedDomain: (d: DomainData) => void;
  onRemoveDomain?: (id: string) => void;
}

export const DomainDropdown: React.FC<Props> = ({
  domains,
  selectedDomain = null,
  open,
  onOpen,
  onSelect,
  onAddDomain,
  newDomainUrl,
  setNewDomainUrl,
  setSelectedDomain,
  onRemoveDomain,
}) => {
  const hasDomains = Array.isArray(domains) && domains.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => onOpen(true)}
        className="flex items-center space-x-3 bg-white hover:bg-gray-200 border border-gray-200 rounded-full px-4 py-2 transition-colors"
      >
        {hasDomains ? (
          <>
            <div className="rounded-full flex items-center justify-center text-lg">
              <>
                {selectedDomain &&
                selectedDomain.logo &&
                (selectedDomain.logo.startsWith("http") ||
                  selectedDomain.logo.startsWith("//")) ? (
                  // show favicon image using next/image
                  <Image
                    src={selectedDomain?.logo}
                    alt={`${selectedDomain?.name} logo`}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  // fallback: show first letter as avatar
                  <span className="text-sm font-medium text-gray-700">
                    {selectedDomain?.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <span className="text-gray-800 font-medium">
                  {selectedDomain?.name ?? "Untitled"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedDomain?.isLive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>
              <span className="text-xs text-gray-500">
                {selectedDomain?.isLive ? "Online" : "Offline"} •{" "}
                {selectedDomain?.lastChecked ?? "—"}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-full flex items-center justify-center text-lg">
              🌐
            </div>
            <div className="flex flex-col items-start">
              <span className="text-gray-800 font-medium">Connect</span>
              <span className="text-xs text-gray-500">
                Add a website to get started
              </span>
            </div>
          </>
        )}

        <svg
          className="w-4 h-4 text-gray-500"
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
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            onClick={() => onOpen(false)}
            className="absolute inset-0 bg-black/20 backdrop-blur"
          />

          {/* Mac-like modal (light mode only) */}
          <div className="relative z-10 w-[30rem] bg-white/95 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-white/60 to-white/30 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                {/* mac dots */}
                <div className="flex items-center space-x-2 mr-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm" />
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Connected Domains
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 gap-6">
              {hasDomains ? (
                <>
                  <div className="space-y-4 max-h-[420px] overflow-y-auto">
                    {domains.map((domain) => (
                      <DomainListItem
                        key={domain.id}
                        domain={domain}
                        selectedId={selectedDomain?.id}
                        onSelect={(d) => {
                          onSelect(d);
                          onOpen(false);
                        }}
                        onRemove={onRemoveDomain}
                      />
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <label className="text-sm text-gray-700 mb-2 block">
                      Connect New Domain
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="url"
                        value={newDomainUrl}
                        onChange={(e) => {
                          setNewDomainUrl(e.target.value);
                        }}
                        placeholder="https://yourdomain.com"
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-3 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => onAddDomain(newDomainUrl)}
                        disabled={!newDomainUrl}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="text-4xl">🌐</div>
                  <div className="text-lg font-medium text-gray-800">
                    No connected domains
                  </div>
                  <div className="text-sm text-gray-500 text-center max-w-[28rem]">
                    Connect a website to start tracking SEO, performance and
                    other metrics.
                  </div>

                  <div className="w-full pt-4">
                    <label className="text-sm text-gray-700 mb-2 block">
                      Connect New Domain
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="url"
                        value={newDomainUrl}
                        onChange={(e) => {
                          setNewDomainUrl(e.target.value);
                        }}
                        placeholder="https://yourdomain.com"
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-3 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => onAddDomain(newDomainUrl)}
                        disabled={!newDomainUrl}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainDropdown;
