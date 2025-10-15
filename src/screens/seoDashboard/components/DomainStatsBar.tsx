/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";

interface Props {
  lastCheckedText?: string;
  seoResult: any;
}

export const DomainStatsBar: React.FC<Props> = ({
  seoResult,
  lastCheckedText = "—",
}) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">SSL Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">CDN Enabled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-600">
              SEO Score: {seoResult?.seo_score}/100
            </span>
          </div>
        </div>
        <div className="text-gray-500">Last crawled: {lastCheckedText}</div>
      </div>
    </div>
  );
};

export default DomainStatsBar;
