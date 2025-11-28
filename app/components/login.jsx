"use client";

import { SecureStorage } from "@/utils/secureStorage";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";  // Removed useSearchParams since it's no longer needed
import { AuthAPI } from "../services/api";
import { ToastContainer, toast } from "react-toastify";

export default function Login({ redirect = "/" }) {  // Accept redirect as prop with default
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email.trim() || !credentials.password.trim()) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await AuthAPI.login(credentials);

      // Backend sets HttpOnly cookies → we just read role from response
      const role = response.data.user?.role;

      if (!role) throw new Error("Role not received");

      // Only store role (non-sensitive)
      localStorage.setItem("role", role); // or use cookies if you prefer

      // Trigger header re-render
      window.dispatchEvent(new Event("authChange"));

      toast.success("Login successful!");
      router.push(redirect);
    } catch (error) {
      const err = error.response?.data;
      const status = error.response?.status;

      if (status === 401) {
        toast.error("Invalid email or password");
      } else if (status === 403) {
        toast.error(err?.error || "Account blocked or not verified");
      } else if (status === 429) {
        toast.error("Too many attempts. Try again later.");
      } else {
        toast.error(err?.detail || "Login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-50 max-w-2xl mx-auto mt-20 p-6 bg-white text-black rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text block font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="text font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`text w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
        <p className="text mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
      {/* Toast container to display messages */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </>
  );
}