import SignupScreen from "@/screens/auth/signup/SignupScreen";

export async function generateMetadata() {
  return {
    title: "Sign Up - Ingents AI",
    description:
      "Create your Ingents AI account to get started with intelligent SEO analytics and AI-powered insights",
    keywords: [
      "sign up",
      "register",
      "Ingents AI",
      "SEO",
      "analytics",
      "account",
    ],
    openGraph: {
      title: "Sign Up - Ingents AI",
      description:
        "Join Ingents AI for powerful SEO analytics and AI-driven insights",
    },
  };
}

export default function SignupPage() {
  return <SignupScreen />;
}
