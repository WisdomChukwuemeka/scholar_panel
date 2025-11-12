"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SecureStorage } from "@/utils/secureStorage";
import { MessageAPI } from "@/app/services/api"; //  your Django API integration
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = SecureStorage.get("access_token");
    setHasToken(!!token);
    if (!token) router.replace("/login");
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading || !hasToken) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await MessageAPI.create(formData);
      toast.success("✅ Message sent successfully!", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
      setFormData({ full_name: "", email: "", text: "" });
    } catch (error) {
      console.error("Message send error:", error);
      toast.error("❌ Failed to send message. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-50 py-16 px-6 sm:px-12 lg:px-24">
      {/* ✅ Toast Container (works globally on this page) */}
      <ToastContainer />

      <div className="max-w-5xl mx-auto">
        {/* Page Heading */}
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Contact Us
        </h2>
        <p className="text-center text-lg text-gray-600 mb-12">
          We’d love to hear from you. Whether you’re an author, reviewer,
          editor, or partner, Journivo is here to connect with you.
        </p>

        {/* CEO Info */}
        <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <Image
              src="/ceo/ceo1.png"
              alt="CEO - Chukwuemeka Wisdom Chinagorom"
              width={200}
              height={200}
              className="rounded-full object-cover border-4 border-gray-200 shadow-md"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-gray-900">
              Editor in Chief
            </h3>
            <p className="text-gray-500 mb-4">Founder & CEO, Journivo</p>
            <ul className="space-y-3">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:wisdomchukwuemeka97@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  wisdomchukwuemeka97@gmail.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong>{" "}
                <a
                  href="tel:+2349059987650"
                  className="text-blue-600 hover:underline"
                >
                  +234 905 998 7650
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* General Contact Form */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Send Us a Message
          </h3>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Your email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Message
              </label>
              <textarea
                rows="5"
                name="text"
                value={formData.text}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Write your message..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-6 py-3 rounded-lg font-semibold transition`}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
