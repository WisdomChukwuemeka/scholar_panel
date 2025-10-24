"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicationAPI } from "@/app/services/api";
import { toast } from "react-toastify";

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

  const router = useRouter();
  const pageSize = 10; // DRF default (change if your pagination size differs)

  // ✅ Fetch publications (supports pagination + search)
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
    } catch (err) {
      // console.error(err);
      // setError("Failed to load publications.");
    }
  };

  // ✅ Fetch user + publications
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

  // ✅ Permission: Only owner can edit rejected/draft/pending publications
  const canEdit = (pub) => {
    if (!currentUser) return false;
    const isOwner =
      pub.author?.id === currentUser.id || pub.author === currentUser.username;
    const editableStatuses = ["draft", "rejected", "pending"];
    return isOwner && editableStatuses.includes(pub.status);
  };

  // ✅ Pagination buttons
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

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

  // ✅ Prevent page reload on pagination
  const handlePagination = (e, page) => {
    e.preventDefault();
    fetchPublications(null, page, search);
  };

 // ✅ Search handling
const handleSearch = async (e) => {
  e.preventDefault();
  const query = search.trim();

  if (!query) {
    // If search is empty, show all publications
    await fetchPublications(null, 1, "");
  } else {
    await fetchPublications(null, 1, query);
  }
};

// ✅ Automatically show all publications when search is cleared
useEffect(() => {
  if (search.trim() === "") {
    fetchPublications(null, 1, "");
  }
}, [search]);



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
          My Publications
        </h2>

        {/* ✅ Create & Search Controls */}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publications.map((pub) => (
                <div
                  key={pub.id}
                  className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow duration-200"
                >
                  {pub.video_file ? (
                    <div className="mb-6">
                      <video
                        src={pub.video_file}
                        controls
                        className="w-full rounded-lg object-cover"
                        style={{ maxHeight: "200px" }}
                        onError={() =>
                          toast.error(`Failed to load video for ${pub.title}`)
                        }
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-4 italic">
                      No video available
                    </p>
                  )}

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                    {pub.title}
                  </h3>

                  <p className="text-gray-700 text-base mb-3 line-clamp-3">
                    <strong>Abstract:</strong> {pub.abstract}
                  </p>

                  <p className="text-gray-600 text-sm mb-4">
                    <strong>Category:</strong>{" "}
                    {pub.category_labels || pub.category_name}
                  </p>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push(`/publications/${pub.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-150"
                    >
                      View
                    </button>
                    {canEdit(pub) && (
                      <button
                        onClick={() =>
                          router.push(`/publications/${pub.id}/edit`)
                        }
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-150"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Pagination */}
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
    </div>
  );
}
