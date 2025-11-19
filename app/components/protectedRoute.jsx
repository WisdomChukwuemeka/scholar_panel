// components/ProtectedRoute.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PUBLIC_PATHS = ['/', '/login', '/register', '/terms', '/verification'];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/me/', {
          credentials: 'include', // This sends cookies
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('role', data.role || ''); // Only store role
          if (PUBLIC_PATHS.includes(pathname) && pathname !== '/') {
            router.replace('/');
          } else {
            setIsAuthenticated(true);
          }
        } else {
          localStorage.removeItem('role');
          if (!PUBLIC_PATHS.includes(pathname)) {
            router.replace('/login');
          } else {
            setIsAuthenticated(true); // Allow public pages
          }
        }
      } catch (err) {
        localStorage.removeItem('role');
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace('/login');
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
}



















// // components/ProtectedRoute.jsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, usePathname } from "next/navigation";

// const PUBLIC_PATHS = [
//   "/", 
//   "/login", 
//   "/register", 
//   "/terms", 
//   "/verification",
//   "/components/about",
//   "/components/contact",
//   "/publications/list",
//   "/our-services",
//   "/resources",
//   "/guidelines/author",
//   "/guidelines/reviewers",
//   "/guidelines/editors",
//   // Add any other public pages here
// ];

// const AUTH_ONLY_PATHS = [
//   "/dashboard",
//   "/profile",
//   "/publications/create",
//   "/payment/history",
//   // Add your protected pages here
// ];

// export default function ProtectedRoute({ children }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         // Call a real authenticated endpoint
//         const res = await fetch("http://localhost:8000/api/auth/me/", {
//           credentials: "include",
//         });

//         if (res.ok) {
//           const data = await res.json();
//           localStorage.setItem("role", data.role || "");

//           // If logged in and on login/register → go home
//           if ((pathname === "/login" || pathname === "/register") && res.ok) {
//             router.replace("/");
//             return;
//           }

//           setIsLoading(false);
//         } else {
//           throw new Error("Not authenticated");
//         }
//       } catch (err) {
//         // Not logged in
//         localStorage.removeItem("role");

//         // Allow access to public pages
//         if (PUBLIC_PATHS.includes(pathname)) {
//           setIsLoading(false);
//         } 
//         // Block access to protected pages
//         else if (AUTH_ONLY_PATHS.some(path => pathname.startsWith(path))) {
//           router.replace("/login");
//         }
//         // For any other page (like /about), allow if public
//         else if (!PUBLIC_PATHS.includes(pathname)) {
//           // Optional: treat unknown pages as public or redirect
//           setIsLoading(false);
//         } else {
//           setIsLoading(false);
//         }
//       }
//     };

//     checkAuth();
//   }, [pathname, router]);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         Loading...
//       </div>
//     );
//   }

//   return <>{children}</>;
// }