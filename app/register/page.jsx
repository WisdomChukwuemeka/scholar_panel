"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthAPI } from "../services/api";
import { useRouter } from "next/navigation";

export default function Register({ onRegister }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "",
    is_scholar: false,
    agreement: false,
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({}); // Field-specific errors
  const [generalError, setGeneralError] = useState(""); // For non-field errors

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" })); // Clear field error
    setGeneralError(""); // Clear general error
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.full_name.trim()) errors.full_name = "Full name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match.";
    }
    if (!formData.role) errors.role = "Role is required.";
    if (!formData.agreement) errors.agreement = "You must agree to the terms.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateForm()) return; // Stop if client validation fails

    setLoading(true);

    try {
      const response = await AuthAPI.register(formData);

      setTimeout(() => {
        if (response.data.role === "editor") {
          router.push("/verification");
        } else {
          router.push("/login");
        }
      }, 1500);

      onRegister?.(response.data);
    } catch (error) {
      if (error.response) {
        const errors = error.response.data || {};
        let fieldErrs = {};
        let nonFieldMsg = "";

        // Handle field errors (e.g., {email: ["Invalid"]})
        for (const key in errors) {
          if (Array.isArray(errors[key]) && key !== "non_field_errors") {
            fieldErrs[key] = errors[key].join(" ");
          }
        }

        // Handle DRF non_field_errors (e.g., ["Passwords don't match"])
        if (errors.non_field_errors && Array.isArray(errors.non_field_errors)) {
          nonFieldMsg = errors.non_field_errors.join(" ");
        }

        // Fallback if no specific errors
        if (Object.keys(fieldErrs).length === 0 && !nonFieldMsg) {
          nonFieldMsg = error.response.data.detail || "Something went wrong. Please check your inputs.";
        }

        setFieldErrors(fieldErrs);
        setGeneralError(nonFieldMsg);
      } else if (error.request) {
        setGeneralError("No response from server. Please check your connection.");
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create a New Account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* FULL NAME */}
          <div>
            <label
              htmlFor="full_name"
              className="text block font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                fieldErrors.full_name ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="John Doe"
              required
            />
            {fieldErrors.full_name && (
              <p className="text-red-600 text-xs mt-1">
                {fieldErrors.full_name}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="text block font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              required
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="text block font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                fieldErrors.password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="***"
              required
            />
            {fieldErrors.password && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              htmlFor="confirm_password"
              className="text block font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                fieldErrors.confirm_password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="****"
              required
            />
            {fieldErrors.confirm_password && (
              <p className="text-red-600 text-xs mt-1">
                {fieldErrors.confirm_password}
              </p>
            )}
          </div>

          {/* ROLE */}
          <div>
            <label
              htmlFor="role"
              className="text block font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`text mt-1 block w-full px-3 py-2 border ${
                fieldErrors.role ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              required
            >
              <option value="">Select your role</option>
              <option value="publisher">Publisher</option>
              <option value="editor">Editor</option>
              <option value="reader">Reader</option>
            </select>
            {fieldErrors.role && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.role}</p>
            )}
          </div>

          {/* SCHOLAR */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_scholar"
              name="is_scholar"
              checked={formData.is_scholar}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label
              htmlFor="is_scholar"
              className="text block font-medium text-gray-700"
            >
              Are you a scholar?
            </label>
          </div>
          {fieldErrors.is_scholar && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.is_scholar}</p>
          )}

          {/* AGREEMENT */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreement"
              name="agreement"
              checked={formData.agreement}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label
              htmlFor="agreement"
              className="text ml-2 block text-gray-900"
            >
              I agree to the{" "}
              <Link
                href={"/terms"}
                className="text-blue-600 hover:text-blue-500"
              >
                Terms and Conditions
              </Link>
            </label>
          </div>
          {fieldErrors.agreement && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.agreement}</p>
          )}

          {/* GENERAL ERROR */}
          {generalError && (
            <p className="text-red-600 text-sm mt-2">{generalError}</p>
          )}

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
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>

        <p className="text mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href={"/login"}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Login
          </Link>
        </p>
      </div>
    </>
  );
}