// components/protectedRoute.jsx (updated)
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SecureStorage } from '@/utils/secureStorage'; // Adjust path as needed

const PUBLIC_PATHS = ['/login', '/register', '/']; // Add other public routes like home if it's public

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = SecureStorage.get('access_token'); // Match the key from your Login component

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (isPublicPath) {
      if (token) {
        // If already logged in, redirect away from public auth pages to home/dashboard
        router.push('/');
      } else {
        // Show the public page (e.g., login form)
        setIsAuthenticated(true);
      }
    } else {
      if (token) {
        // Protected path with token: allow
        setIsAuthenticated(true);
      } else {
        // Protected path without token: redirect to login
        router.push('/login');
      }
    }

    setIsLoading(false);
  }, [pathname]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirect will handle it
  }

  return children;
}