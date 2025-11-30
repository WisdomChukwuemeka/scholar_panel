"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
    } else {
      setAllowed(true);
    }
  }, []);

  if (!allowed) {
    return (
      <div className="w-full h-screen bg-white"></div> 
    ); // solid blank screen
  }

  return children;
}
