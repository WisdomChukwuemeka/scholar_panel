import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  // Use your local API URL for testing
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL 
  // || "http://localhost:8000/api";

  const res = await fetch(`${API_URL}/me/`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  return <>{children}</>;
}
