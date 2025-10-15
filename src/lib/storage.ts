/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Utility helpers for storing and retrieving company details in localStorage
export type CompanyDetails = {
  name: string;
  industry?: string;
  description?: string;
  tone?: string;
  audience?: string;
  values?: string[];
  website?: string;
  brandKeywords?: string[];
};

const KEY = "companyDetails";

export function setCompanyDetails(details: CompanyDetails | null) {
  if (typeof window === "undefined") return;
  try {
    if (details === null) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, JSON.stringify(details));
    }
  } catch (err) {
    // swallow errors - storage might be disabled
    // eslint-disable-next-line no-console
    console.error("Failed to write companyDetails to localStorage", err);
  }
}

export function getCompanyDetails(): CompanyDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CompanyDetails;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse companyDetails from localStorage", err);
    return null;
  }
}

// Convenience: write the default example company the user provided
export function storeDefaultCompanyDetails() {
  const defaultDetails: CompanyDetails = {
    name: "AstraNova Technologies",
    industry: "AI and Automation Solutions",
    description:
      "We build intelligent automation tools that help businesses streamline operations and enhance productivity using cutting-edge AI models.",
    tone: "professional yet friendly",
    audience: "tech enthusiasts, startups, and innovation-driven companies",
    values: ["innovation", "efficiency", "transparency"],
    website: "https://www.astranova.tech",
    brandKeywords: ["AI", "automation", "future of work", "efficiency", "smart tech"],
  };

  setCompanyDetails(defaultDetails);
}

export default {
  setCompanyDetails,
  getCompanyDetails,
  storeDefaultCompanyDetails,
};
