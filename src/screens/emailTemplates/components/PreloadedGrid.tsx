"use client";
import React from "react";
import TemplateCard from "./TemplateCard";

const hardcoded = [
  {
    id: "promo-1",
    title: "UI/UX designer",
    tag: "Student",
    tagType: "Promotional",
    subtitle:
      "Master the principles of user interface and user experience design.",
    tasks: 350,
    projects: 3,
    progress: 72,
    modulesCompleted: 12,
    modulesTotal: 16,
    actionLabel: "Continue",
  },
  {
    id: "news-1",
    title: "QA engineer",
    tag: "Recommended",
    tagType: "Newsletter",
    subtitle:
      "Learn the fundamentals of quality assurance and software testing.",
    tasks: 622,
    projects: 4,
    progress: 0,
    startDate: "20 July",
    actionLabel: "Apply",
  },
  {
    id: "trans-1",
    title: "Recruiter",
    tag: "Popular",
    tagType: "Transactional",
    subtitle: "Understand the hiring process, talent acquisition strategies.",
    tasks: 350,
    projects: 622,
    progress: 0,
    startDate: "20 July",
    actionLabel: "Apply",
  },
  {
    id: "promo-2",
    title: "Front-end developer",
    tag: "Student",
    tagType: "Promotional",
    subtitle:
      "Build stunning and responsive websites using modern front-end technologies.",
    tasks: 350,
    projects: 3,
    progress: 0,
    startDate: "20 July",
    actionLabel: "Apply",
  },
];

// pastel gradients to cycle through (4 colors)
const palette = [
  "from-pink-100 to-pink-50",
  "from-sky-100 to-sky-50",
  "from-amber-100 to-amber-50",
  "from-emerald-100 to-emerald-50",
];

export default function PreloadedGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-3 gap-6">
      {hardcoded.map((t, i) => (
        <TemplateCard
          key={t.id}
          template={{
            ...t,
            gradient: palette[i % palette.length],
          }}
        />
      ))}
    </div>
  );
}
