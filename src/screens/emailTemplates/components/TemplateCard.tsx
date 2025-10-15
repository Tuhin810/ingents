"use client";
import React from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Mail,
  UserCircle2Icon,
  UserRoundCog,
} from "lucide-react";

type Template = {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  tagType: string;
  tasks?: number;
  projects?: number;
  progress?: number;
  modulesCompleted?: number;
  modulesTotal?: number;
  startDate?: string;
  actionLabel?: string;
  avatar?: string;
  gradient?: string; // e.g. from-pink-100 to-pink-50
};

export default function TemplateCard({ template }: any) {
  const {
    title,
    subtitle,
    tag,
    tagType,
    tasks,
    projects,
    progress = 0,
    modulesCompleted,
    modulesTotal,
    startDate,
    actionLabel = "Apply",
    avatar,
    gradient = "from-pink-100 to-pink-50",
  } = template;

  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  const tagColor =
    tagType === "Promotional"
      ? "bg-blue-100 text-blue-600"
      : tagType === "Newsletter"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-gray-100 text-gray-600";

  return (
    <div className="w-full max-w-sm rounded-3xl p-1 bg-gradient-to-b from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Gradient Header */}
      <div
        className={`relative p-6 rounded-3xl bg-gradient-to-br ${gradient} flex flex-col justify-between `}
      >
        {/* Tag */}
        {tag && (
          <span
            className={`absolute top-4 left-4 text-xs font-medium px-3 py-1 rounded-full bg-white/60`}
          >
            {tag}
          </span>
        )}

        {/* Title & Subtitle */}
        <div className="mt-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 font-semibold mt-1 leading-snug">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quisquam
            eius atque.
          </p>

          <div className="flex items-center font-semibold gap-2 mt-6 mb-4 w-full text-sm text-gray-700">
            <span className="flex items-center gap-1">
              <span>
                <Mail />
              </span>{" "}
              62 mail sent
            </span>
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>
                  <UserCircle2Icon />
                </span>{" "}
                72 People Used
              </span>
            </>
          </div>
        </div>
        <div className="">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Progress</p>
            <p className="text-sm font-medium text-gray-900">{pct}%</p>
          </div>

          {/* Progress bar */}
          <div className="mt-2 w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gray-900 transition-all"
              style={{ width: `75%` }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-6 py-2 rounded-b-3xl">
        <div className="flex items-center justify-end mt-1 gap-2">
          <button className="bg-purple-500 bg-black/70 hover:bg-gray-900 text-white p-1 rounded-full text-sm transition-colors">
            <ArrowUpRight />
          </button>
          <button className="bg-black/70 hover:bg-gray-900 text-white px-5 py-1.5 rounded-full text-sm transition-colors">
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
