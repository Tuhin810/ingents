"use client";
import React, { useState } from "react";
import Layout from "../layout/Layout";
import FollowersChart from "../socialMedia/components/FollowersChart";
import FollowersOverviewCard from "../socialMedia/components/FollowersOverviewCard";
import DonutChart from "./DonutChart";
import EmailMarketingAiSidebar from "./EmailMarketingAiSidebar";
import EmailMarketingChat from "./emailMarketingChatbox/EmailMarketingChatbox";
import TotalMailsCard from "./TotalMailsCard";
import EmailBarchart from "./components/barchart/EmailBarchart";
import EmailTemplateNav from "./components/emailTemplateNav/EmailTemplateNav";
import { EmailStats } from "./components/emailStats/EmailStats";

export const EmailMarketing = () => {
  const [seoResult, setSeoResult] = React.useState<unknown | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  if (isFullScreen) {
    return (
      <EmailMarketingChat
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
      />
    );
  }

  return (
    <Layout>
      <div className="mx-auto px-5 max-w-7xl font-sans gap-5 flex flex-col lg:flex-row  grid grid-cols-1   lg:grid-cols-12">
        <div className="flex-grow  lg:col-span-8 h-[87vh] overflow-y-auto pb-10 hidescroll">
          {/* <Header seoResult={seoResult} /> */}

          <main className="mt-8 space-y-6 pr-2">
            <EmailBarchart />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmailTemplateNav />
              <EmailStats />
            </div>
          </main>
        </div>
        <div className="w-full   flex-shrink-0 mt-8 lg:mt-0 lg:col-span-4">
          {/* <AiSidebar
            aiUrl="seomi"
            context={localStorage.getItem("seo_result")}
          /> */}
          <EmailMarketingAiSidebar
            isFullScreen={isFullScreen}
            setIsFullScreen={setIsFullScreen}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EmailMarketing;
