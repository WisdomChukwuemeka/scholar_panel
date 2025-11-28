// app/login/page.js
import Login from "@/components/login";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function LoginPage() {
  // If already logged in → go home
  if (cookies().get("access_token")) {
    redirect("/");
  }

  return <Login />;
}