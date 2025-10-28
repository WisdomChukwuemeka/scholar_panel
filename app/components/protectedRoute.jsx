'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SecureStorage } from '@/utils/secureStorage'; // Adjust path as needed

const AUTH_PATHS = ['/login', '/register', '/terms', '/verification']; // Paths where logged-in users should be redirected away from
const PUBLIC_PATHS = ['/']; // Truly public paths like home, accessible regardless of auth

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const token = SecureStorage.get('access_token');

      const isAuthPath = AUTH_PATHS.includes(pathname);
      const isPublicPath = PUBLIC_PATHS.includes(pathname) || isAuthPath;

      if (token) {
        if (isAuthPath) {
          // Redirect logged-in users away from login/register to home
          router.push('/');
        }
        // For logged-in users, allow access to protected and public paths
        setIsAuthenticated(true);
      } else {
        if (isPublicPath) {
          // Allow unauthenticated users on public paths (including home, login, register)
          setIsAuthenticated(true);
        } else {
          // Redirect unauthenticated users from protected paths to login
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error during auth check:', error);
      // Optionally handle error, e.g., treat as unauthenticated
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-600">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirect will handle navigation
  }

  return children;
}