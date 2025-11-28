// app/login/page.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Login from "@/components/login"; // Adjust path if needed

export const metadata = {
  title: "Login | Scholar Panel",
  description: "Log in to your account",
};

export default function LoginPage({ searchParams }) {
  // Server-side: Check if user is already logged in
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token");

  // If already logged in → instantly redirect (no flash, no loop)
  if (accessToken) {
    const redirectTo = searchParams.redirect || "/dashboard";
    redirect(redirectTo);
  }

  // Not logged in → show login form
  const redirectTo = searchParams.redirect || "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Login redirect={redirectTo} />
      </div>
    </div>
  );
}