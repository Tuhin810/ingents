"use client";
import React from "react";
import Layout from "../layout/Layout";
import FollowersChart from "../socialMedia/components/FollowersChart";

import TotalMessagesCard from "../socialMedia/components/TotalMessagesCard";
import FollowersOverviewCard from "../socialMedia/components/FollowersOverviewCard";
import AiSidebar from "@/components/shared/aiSidebar/AiSidebar";
import { Header } from "./components/Header";

export const SeoDashBoard = () => {
  const [seoResult, setSeoResult] = React.useState<unknown | null>(null);

  React.useEffect(() => {
    try {
      // try both keys for compatibility
      const v =
        localStorage.getItem("seo_result") ?? localStorage.getItem("seoResult");
      if (v) {
        try {
          setSeoResult(JSON.parse(v).body);
          console.log(
            "SEO Result (parsed) from localStorage:",
            JSON.parse(v).body
          );
        } catch (parseErr) {
          // Not valid JSON, store raw string
          setSeoResult(JSON.parse(v).body);
          console.warn(
            "Failed to parse stored seo result, keeping raw string:",
            parseErr
          );
        }
      } else {
        setSeoResult(null);
      }
    } catch (err) {
      // localStorage not available (SSR) or access denied
      console.warn("localStorage unavailable:", err);
    }
  }, []);

  return (
    <Layout>
      <div className="mx-auto px-5 max-w-7xl font-sans gap-5 flex flex-col lg:flex-row  grid grid-cols-1   lg:grid-cols-12">
        <div className="flex-grow  lg:col-span-8 h-[87vh] overflow-y-auto pb-10 hidescroll">
          <Header seoResult={seoResult} />
          <main className="mt-8 space-y-6 pr-2">
            <FollowersChart />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TotalMessagesCard />
              <FollowersOverviewCard />
            </div>
          </main>
        </div>
        <div className="w-full   flex-shrink-0 mt-8 lg:mt-0 lg:col-span-4">
          <AiSidebar
            aiUrl="seomi"
            context={localStorage.getItem("seo_result")}
          />
        </div>
      </div>
    </Layout>
  );
};
