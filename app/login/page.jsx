"use client"
import { useSearchParams } from "next/navigation";
import Login from "../components/login";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  return (
    <div className="max-w-lg mx-auto mt-20">
      <Login redirect={redirect} />
    </div>
  );
}
