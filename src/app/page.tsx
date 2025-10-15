import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to default site dashboard
  redirect("/dashboard");
}
