"use client";
import React from "react";
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
  domain: DomainData;
  selectedId?: string;
  onSelect?: (d: DomainData) => void;
  onRemove?: (id: string) => void;
}

export const DomainListItem: React.FC<Props> = ({
  domain,
  selectedId,
  onSelect,
  onRemove,
}) => {
  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-colors ${
        selectedId === domain.id ? "bg-gray-100" : "hover:bg-gray-100"
      }`}
    >
      <span className="text-lg w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
        {domain.logo &&
        (domain.logo.startsWith("http") || domain.logo.startsWith("//")) ? (
          // show favicon image using next/image
          <Image
            src={domain.logo}
            alt={`${domain.name} logo`}
            width={32}
            height={32}
            className="object-cover"
          />
        ) : (
          // fallback: show first letter as avatar
          <span className="text-sm font-medium text-gray-700">
            {domain.name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </span>
      <div className="flex-1" onClick={() => onSelect?.(domain)}>
        <div className="flex items-center space-x-2">
          <span className="text-gray-800 text-sm font-medium">
            {domain.name}
          </span>
          <div
            className={`w-2 h-2 rounded-full ${
              domain.isLive ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>
        <span className="text-xs text-gray-500">{domain.url}</span>
      </div>

      <div className="flex items-center space-x-2">
        {domain.isLive && (
          <span className="text-xs text-green-600 font-medium">LIVE</span>
        )}
        <button
          onClick={() => onRemove?.(domain.id)}
          className="p-2 rounded hover:bg-gray-100 text-gray-500"
          aria-label={`Remove ${domain.name}`}
          title={`Remove ${domain.name}`}
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
  );
};

export default DomainListItem;
