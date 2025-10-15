import LoginScreen from "@/screens/auth/login/LoginScreen";

export async function generateMetadata() {
  return {
    title: "Sign In - Ingents AI",
    description:
      "Sign in to your Ingents AI account to access intelligent SEO analytics and AI-powered insights",
    keywords: ["sign in", "login", "Ingents AI", "SEO", "analytics", "account"],
    openGraph: {
      title: "Sign In - Ingents AI",
      description:
        "Access your Ingents AI dashboard for powerful SEO analytics",
    },
  };
}

export default function LoginPage() {
  return <LoginScreen />;
}
