// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { PublicationAPI } from "@/app/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Book, UserRound } from "lucide-react";
import Link from "next/link";

export default function EditorDashboard() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPub, setSelectedPub] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggin, setIsLoggin] = useState(false);
  const [role, setRole] = useState("")
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [show404, setShow404] = useState(false);
  const pageSize = 10;
  const totalPages = Math.ceil(count / pageSize);



  useEffect(() => {
      const updateAuthState = () => {
        const storedRole = localStorage.getItem("role");
        setIsLoggin(!!storedRole);           // ← Now correct
        setRole(storedRole?.trim().toLowerCase() || "");
      };
  
      updateAuthState();
      window.addEventListener("authChange", updateAuthState);
  
      return () => {
        window.removeEventListener("authChange", updateAuthState);
      };
    }, []);

    useEffect(() => {
  if (!isLoggin || role !== "editor") {
    setShow404(true);

    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [isLoggin, role]);



  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      try {
        const response = await PublicationAPI.list(`?page=${page}`);
        setPublications(response.data.results || []);
        setCount(response.data.count || 0);
        console.log("Fetched publications:", response.data.results);
      } catch (error) {
        toast.error("Failed to load publications");
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, [page]);

  // ALL EDITOR ACTIONS USE /review/
  const handleAction = async (id, action, note = "") => {
    try {
      const payload = { action };
      if (action === "reject") payload.rejection_note = note;

      await PublicationAPI.review(id, payload);

      setPublications(prev =>
        prev.map(pub => {
          if (pub.id !== id) return pub;
          const updated = { ...pub, status: action === "under_review" ? "under_review" : action };
          if (action === "reject") updated.rejection_note = note;
          return updated;
        })
      );

      const msg = action === "under_review" ? "under review" : action;
      toast.success(`Publication marked as ${msg}!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed");
    }
  };

  const openRejectModal = (pub) => {
    setSelectedPub(pub);
    setRejectionNote("");
    setIsModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionNote.trim()) {
      toast.error("Rejection note is required.");
      return;
    }
    await handleAction(selectedPub.id, "reject", rejectionNote);
    setIsModalOpen(false);
  };

  const handleViewDocument = (pub) => {
    if (pub.file) {
      window.open(pub.file, "_blank");
    } else if (pub.content) {
      const win = window.open("", "_blank");
      win.document.write(`
        <html><head><title>${pub.title}</title></head>
        <body style="font-family:sans-serif;padding:20px;">
          <h1>${pub.title}</h1>
          <h3>Abstract</h3><p>${pub.abstract}</p>
          <h3>Content</h3><p>${pub.content}</p>
        </body></html>
      `);
      win.document.close();
    } else {
      toast.warning("No content available.");
    }
  };
  

  // if (loading) {
  //   return <div className="flex justify-center items-center h-screen">Loading...</div>;
  // }

  return (
    <>
    {isLoggin && role === "editor" ? (
      <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-6">Editor Dashboard</h1>

      {publications.length === 0 ? (
        <p className="text-center text-gray-500">No publications.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {publications.map((pub) => (
              <motion.div
                key={pub.id}
                layout
                className="bg-white rounded-2xl shadow-md p-5"
              >
                {pub.video_file ? (
                  <video src={pub.video_file} controls className="w-full rounded-lg mb-4" style={{ maxHeight: "200px" }} />
                ) : (
                  <p className="text-gray-500 text-sm mb-4">No video</p>
                )}

                <h2 className="text-xl font-semibold mb-2">{pub.title}</h2>
                <p className="text-gray-600 line-clamp-3 mb-3">{pub.abstract}</p>
                <p className="text-sm text-gray-400 mb-2">Author: {pub.author}</p>

                <p className={`text-sm font-medium ${
                  pub.status === "approved" ? "text-green-600" :
                  pub.status === "rejected" ? "text-red-600" :
                  pub.status === "under_review" ? "text-blue-600" :
                  "text-yellow-600"
                }`}>
                  Status: {pub.status}
                </p>

                {pub.status === "rejected" && pub.rejection_note && (
  <div className="mt-3">
    <Link href={`/dashboard/rejection-note/${pub.id}`}>
      <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg px-4 py-3 hover:bg-red-100 transition cursor-pointer">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p className="text-red-700 text-sm font-medium">Editor’s Rejection Note Available</p>
          <p className="text-xs text-red-600">Click to read full feedback</p>
        </div>
      </div>
    </Link>
  </div>
)}

                <button
                  onClick={() => handleViewDocument(pub)}
                  className="w-full bg-indigo-600 text-white py-2 rounded mt-4 hover:bg-indigo-700"
                >
                  View Document
                </button>
                <Link href={`/dashboard/annotate/${pub.id}`}>
                <div
                  className="w-full bg-indigo-600 text-white py-2 rounded mt-4 hover:bg-indigo-700"
                >
                  Annotate
                </div>
                </Link>
                

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAction(pub.id, "under_review")}
                    disabled={pub.status === "under_review"}
                    className={`flex-1 py-2 rounded text-white transition ${
                      pub.status === "under_review"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleAction(pub.id, "approve")}
                    disabled={pub.status === "approved"}
                    className={`flex-1 py-2 rounded text-white transition ${
                      pub.status === "approved"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(pub)}
                    disabled={pub.status === "rejected"}
                    className={`flex-1 py-2 rounded text-white transition ${
                      pub.status === "rejected"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >Prev</button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-600 text-white" : ""}`}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >Next</button>
            </div>
          )}
        </>
      )}

      {/* Rejection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-bold mb-3">Reject Publication</h2>
              <p className="text-sm text-gray-600 mb-4">
                Reason for rejecting <strong>{selectedPub?.title}</strong>:
              </p>
              <textarea
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-red-500"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Enter detailed feedback..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >Cancel</button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionNote.trim()}
                  className={`px-4 py-2 rounded text-white ${
                    rejectionNote.trim()
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                >Submit Rejection</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    ) : (
  <div className="flex flex-col items-center justify-center h-screen text-center p-6">
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        {/* Man holding books */}
        <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mb-6"
      >
        <UserRound className="w-32 h-32 text-gray-700" />
      </motion.div>


        {/* Floating books */}
        <div className="flex gap-6 mt-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ y: -10 }}
            animate={{ y: 10 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.2 + i * 0.2,
            }}
          >
            <Book className="w-10 h-10 text-indigo-600 opacity-80" />
          </motion.div>
        ))}
      </div>


        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-semibold mt-6 text-gray-700"
        >
          404 — Invalid Url
        </motion.h2>

        <p className="text-gray-500 mt-2">
          Redirecting you to the home page...
        </p>
      </motion.div>
    </AnimatePresence>
  </div>

)}
    
    </>
  );
}