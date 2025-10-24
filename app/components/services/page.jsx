"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SecureStorage } from "@/utils/secureStorage";

export default function ServicesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = SecureStorage.get("access_token");
    setHasToken(!!token);
    if (!token) {
      router.replace("/login");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500); // Show spinner for 2 seconds
  }, []);

  if (isLoading || !hasToken) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Page Heading */}
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Our Services
        </h2>
        <p className="text-center text-lg text-gray-600 mb-12">
          At Journivo, we are committed to advancing knowledge through high-quality publishing,
          professional editorial services, and global research dissemination.
        </p>

        {/* Services Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Academic Publishing
            </h3>
            <p className="text-gray-600">
              We publish peer-reviewed journals, conference proceedings, and research reports across diverse disciplines, ensuring global visibility for scholars and institutions.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Editorial & Peer Review
            </h3>
            <p className="text-gray-600">
              Our editorial board and reviewers maintain high academic standards, providing constructive feedback to strengthen the quality of each publication.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Indexing & Archiving
            </h3>
            <p className="text-gray-600">
              Journivo ensures your research is indexed, discoverable, and preserved in leading databases and repositories for long-term academic visibility.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Conference Publishing
            </h3>
            <p className="text-gray-600">
              We partner with academic institutions to publish conference proceedings, ensuring participants’ research contributions are widely accessible.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Research Promotion
            </h3>
            <p className="text-gray-600">
              With digital marketing, open-access strategies, and collaborations, Journivo amplifies your research impact globally.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Author Support
            </h3>
            <p className="text-gray-600">
              From manuscript formatting to publication guidance, we provide full support to ensure a smooth publishing experience for authors.
            </p>
          </div>
        </div>

        {/* Payment Plans Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Publishing Payment Plans
          </h2>
          <p className="text-center text-gray-600 mb-12">
            We offer affordable, transparent, and flexible publishing plans for authors and institutions.
          </p>

          {/* Static Pricing Plans */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Publication Fee</h3>
              <p className="text-2xl font-bold text-blue-600 mb-4">₦25,000</p>
              <p className="text-gray-600">One-time fee for initial publication submission.</p>
            </div>
            <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Fee</h3>
              <p className="text-2xl font-bold text-blue-600 mb-4">₦3,000</p>
              <p className="text-gray-600">Per review after two free reviews are used.</p>
            </div>
            <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
              <Link href="/publications/new" className="inline-block w-full">
                <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                  Submit Publication
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}