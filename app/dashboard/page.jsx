// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { PublicationAPI } from "@/app/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditorDashboard() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPub, setSelectedPub] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 6;
  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      try {
        const response = await PublicationAPI.list(`?page=${page}`);
        setPublications(response.data.results || []);
        setCount(response.data.count || 0);
        console.log("Publications:", response.data.results);
      } catch (error) {
        console.error("Error fetching publications:", error);
        toast.error("Failed to load publications");
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, [page]);

  const handleUnderReview = async (id) => {
    try {
      await PublicationAPI.update(id, { status: "under_review" });
      setPublications((prev) =>
        prev.map((pub) =>
          pub.id === id
            ? { ...pub, status: "under_review", rejection_note: null }
            : pub
        )
      );
      toast.info("Publication marked as under review.");
    } catch (error) {
      console.error("Error marking as under review:", error);
      toast.error(error.response?.data?.status || "Failed to update publication status.");
    }
  };

  const handleApprove = async (id) => {
    try {
      await PublicationAPI.update(id, { status: "approved" });
      setPublications((prev) =>
        prev.map((pub) =>
          pub.id === id
            ? { ...pub, status: "approved", rejection_note: null }
            : pub
        )
      );
      toast.success("Publication approved successfully!");
    } catch (error) {
      console.error("Error approving publication:", error);
      toast.error(error.response?.data?.status || "Failed to approve publication.");
    }
  };

  const openRejectModal = (pub) => {
    setSelectedPub(pub);
    setRejectionNote("");
    setIsModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedPub || !rejectionNote.trim()) {
      toast.error("Rejection note is required.");
      return;
    }
    try {
      await PublicationAPI.update(selectedPub.id, {
        status: "rejected",
        rejection_note: rejectionNote,
      });
      setPublications((prev) =>
        prev.map((pub) =>
          pub.id === selectedPub.id
            ? { ...pub, status: "rejected", rejection_note: rejectionNote }
            : pub
        )
      );
      setIsModalOpen(false);
      toast.success("Publication rejected with note sent.");
    } catch (error) {
      console.error("Error rejecting publication:", error);
      toast.error(error.response?.data?.rejection_note || "Failed to reject publication.");
    }
  };

  const handleViewDocument = (pub) => {
    if (pub.file) {
      window.open(pub.file, "_blank");
    } else if (pub.content) {
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`
        <html>
          <head>
            <title>${pub.title}</title>
            <style>
              body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
              h1 { color: #1e293b; }
              p { color: #374151; }
            </style>
          </head>
          <body>
            <h1>${pub.title}</h1>
            <h3>Abstract</h3>
            <p>${pub.abstract}</p>
            <h3>Content</h3>
            <p>${pub.content}</p>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      toast.warning("No document or content available to view.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading publications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Editor Dashboard — Manage Publications
      </h1>
      {publications.length === 0 ? (
        <p className="text-center text-gray-500">No publications available.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {publications.map((pub) => (
              <motion.div
                key={pub.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between"
              >
                <div>
                  {pub.video_file ? (
                    <div className="mb-4">
                      <video
                        src={pub.video_file}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: "200px" }}
                        onError={() => toast.error(`Failed to load video for ${pub.title}`)}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-4">No video available</p>
                  )}
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {pub.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-3">
                    {pub.abstract}
                  </p>
                  <p className="text-sm text-gray-400 mb-2">
                    Author: {pub.author || "Unknown"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      pub.status === "approved"
                        ? "text-green-600"
                        : pub.status === "rejected"
                        ? "text-red-600"
                        : pub.status === "under_review"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  >
                    Status: {pub.status.replace("_", " ")}
                  </p>
                  {pub.status === "rejected" && pub.rejection_note && (
                    <div className="bg-red-50 border border-red-200 rounded-lg mt-3 p-3">
                      <p className="text-red-700 text-sm font-medium">
                        Editor’s Note:
                      </p>
                      <p className="text-gray-700 text-sm mt-1">
                        {pub.rejection_note}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleViewDocument(pub)}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition mt-4"
                >
                  View PDF
                </button>
                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                  <button
                    onClick={() => handleUnderReview(pub.id)}
                    className={`bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition ${
                      pub.status === "under_review" && "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={pub.status === "under_review"}
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleApprove(pub.id)}
                    className={`bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition ${
                      pub.status === "approved" && "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={pub.status === "approved"}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(pub)}
                    className={`bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition ${
                      pub.status === "rejected" && "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={pub.status === "rejected"}
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                className={`px-4 py-2 rounded-md border ${
                  page === 1
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-blue-600 border-blue-500 hover:bg-blue-100"
                }`}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 rounded-md border transition ${
                    page === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-blue-600 border-blue-400 hover:bg-blue-100"
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </motion.button>
              ))}
              <button
                className={`px-4 py-2 rounded-md border ${
                  page === totalPages
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-blue-600 border-blue-500 hover:bg-blue-100"
                }`}
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-[90%] md:w-[400px] shadow-xl"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Reject Publication
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Provide a reason for rejecting{" "}
                <span className="font-semibold">{selectedPub?.title}</span>.
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2 h-28 focus:outline-none focus:ring-2 focus:ring-red-400"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Enter rejection reason..."
              />
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionNote.trim()}
                  className={`px-4 py-2 rounded-lg text-white transition ${
                    rejectionNote.trim()
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                >
                  Submit Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}