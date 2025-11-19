// components/ProtectedRoute.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = [
  "/", "/login", "/register", "/terms", "/verification", "/about", "/our-services",
];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/me/", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("role", data.role || "");

          // If logged in but on login/register → redirect home
          if (pathname === "/login" || pathname === "/register") {
            router.replace("/");
            return;
          }

          setIsChecking(false); // allow page
        } else {
          throw new Error("Not authenticated");
        }
      } catch {
        localStorage.removeItem("role");

        // User is NOT authenticated
        if (!PUBLIC_PATHS.includes(pathname)) {
          // Instantly redirect with NO loader time
          router.replace("/login");
          return;
        }

        setIsChecking(false); // public page → allow render
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
