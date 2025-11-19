"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicationAPI } from "@/app/services/api";
import { toast } from "react-toastify";
import { motion } from 'framer-motion'

export default function PublicationListPage() {
  const [publications, setPublications] = useState([]);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pageSize = 10;

  // Loading timer
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch publications
  const fetchPublications = async (url = null, page = 1, query = "") => {
    try {
      const response = url
        ? await PublicationAPI.customGet(url)
        : await PublicationAPI.listitem({ params: { page, search: query } });

      const data = response.data;
      setPublications(data.results || []);
      setNextPage(data.next);
      setPrevPage(data.previous);
      setCount(data.count || 0);
      setTotalPages(Math.ceil(data.count / pageSize));
      setCurrentPage(page);
      console.log(data.results)
    } catch (err) {
      // console.error(err);
    }
  };

  // Fetch user + publications
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const res = await PublicationAPI.getCurrentUser();
        setCurrentUser(res.data);
      } catch {
        // console.warn("Could not fetch current user.");
      } finally {
        await fetchPublications(null, 1, "");
      }
    };
    fetchUserAndData();
  }, []);

  const canEdit = (pub) => {
    if (!currentUser) return false;
    const isOwner =
      pub.author?.id === currentUser.id || pub.author === currentUser.username;
    const editableStatuses = ["draft", "rejected", "pending"];
    return isOwner && editableStatuses.includes(pub.status);
  };

  const handlePagination = (e, page) => {
    e.preventDefault();
    fetchPublications(null, page, search);
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={(e) => handlePagination(e, i)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
            currentPage === i
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      pages.push(<span key="ellipsis" className="px-2 text-gray-500">…</span>);
      pages.push(
        <button
          key={totalPages}
          onClick={(e) => handlePagination(e, totalPages)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === totalPages
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {totalPages}
        </button>
      );
    }
    return pages;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = search.trim();
    await fetchPublications(null, 1, query || "");
  };

  useEffect(() => {
    if (search.trim() === "") fetchPublications(null, 1, "");
  }, [search]);

  // ✅ Updated render: never return early
  const colors = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
      {loading ? (
        <div className="flex items-center justify-center h-screen space-x-4">
          {colors.map((color, index) => (
            <motion.div
              key={index}
              className={`h-6 w-6 rounded-full ${color}`}
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "loop",
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
            Publications
          </h2>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search publications..."
                className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-r-md hover:bg-indigo-700"
              >
                Search
              </button>
            </form>
          </div>

          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded-md mb-6 text-sm font-medium">
              {error}
            </p>
          )}

          {publications.length === 0 ? (
            <p className="text-gray-600 text-center py-6">No publications found.</p>
          ) : (
            <>
              {publications.map((pub) => (
                <div
                  key={pub.id}
                  className="border border-gray-200 rounded-lg p-6 mb-6 bg-white hover:shadow-md transition-shadow duration-200 flex justify-between items-center"
                >
                  <div>
                    <h3>{pub.title}</h3>
                    <p>Author: {pub.author}</p>
                    <p>Date: {new Date(pub.publication_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push(`/publications/${pub.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-150 cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center items-center space-x-2 mt-8 flex-wrap">
                <button
                  disabled={!prevPage}
                  onClick={(e) => handlePagination(e, currentPage - 1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    prevPage
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>

                {renderPaginationButtons()}

                <button
                  disabled={!nextPage}
                  onClick={(e) => handlePagination(e, currentPage + 1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    nextPage
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
