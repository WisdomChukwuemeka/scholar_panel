"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CommentAPI, PointRewardAPI } from "@/app/services/api";
import { formatDistanceToNow } from "date-fns";
import { Trophy } from "lucide-react";

export default function NewCommentForm({ publicationId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState(null);


  // Scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // === Fetch Comments ===
  const fetchComments = useCallback(async () => {
    if (!publicationId) return;
    try {
      const res = await CommentAPI.list(publicationId);
      const data = res.data || [];
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [publicationId]);

  // === Fetch Total Points ===
  const fetchTotalPoints = useCallback(async () => {
    if (!publicationId) return;
    try {
      const res = await PointRewardAPI.list(publicationId);
      const data = res.data.results || res.data || [];
      const total = data.reduce((acc, p) => acc + (p.points || 0), 0);
      setTotalPoints(total);
    } catch (err) {
      console.error("Points fetch failed:", err);
    }
  }, [publicationId]);

  // === Submit Comment ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await CommentAPI.create(publicationId, { text: newComment });
      setComments((prev) => [...prev, res.data]);
      console.log("Comment posted:", res.data);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error("Failed to post comment.");
    }
  };

  // === Edit Comment ===
const handleEdit = async (commentId) => {
  if (!editText.trim()) return;

  try {
    const res = await CommentAPI.update(publicationId, commentId, { text: editText });

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? res.data : c))
    );

    setEditingId(null);
    setEditText("");
    toast.success("Comment updated!");
  } catch (err) {
    toast.error("Failed to update comment.");
  }
};

// === Delete Comment ===
const handleDelete = async (commentId) => {
  try {
    await CommentAPI.delete(publicationId, commentId);

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setDeleteId(null);
    toast.success("Comment deleted!");
  } catch (err) {
    toast.error("Failed to delete comment.");
  }
};

const canModify = (createdAt) => {
  const created = new Date(createdAt);
  const now = new Date();

  const diffMs = now - created; // difference in milliseconds
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= 20; // return true ONLY within 20 minutes
};




  // === Load Data on Mount ===
  useEffect(() => {
    if (!publicationId) return;
    fetchComments();
    fetchTotalPoints();
  }, [publicationId, fetchComments, fetchTotalPoints]);

  // === Scroll on new comment ===
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // === Early return if no ID ===
  if (!publicationId) {
    return <div className="text-center text-red-500">Invalid publication</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Points Section */}
      <div className="bg-indigo-50 xl:min-w-4xl xl:mx-auto rounded-xl p-4 border border-indigo-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-indigo-800">
            Discussion
          </h3>
          <i className="bi bi-chat-text text-blue-900"></i>
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-150 xl:min-w-4xl xl:mx-auto overflow-y-auto p-3 bg-white/70 rounded-xl border border-gray-200 shadow-inner">
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((cmt) => {
              const isMe = cmt.is_current_user;
              return (
                <motion.div
                  key={cmt.id}
                  className={`flex items-end gap-2 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-sm">
                      {cmt.author_name?.[0]?.toUpperCase() || "A"}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[70%] ${
                      isMe
                        ? "bg-gray-100 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                  <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-indigo-700">
                      {cmt.author_name || "Anonymous"}
                    </p>
                    
                    <span className="text-[11px] text-gray-400">
                      {formatDistanceToNow(new Date(cmt.created_at))} ago
                    </span>
                  </div>
                  
                  <p className="text-[15px] leading-relaxed text-gray-800">
      {editingId === cmt.id ? (
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full border rounded p-2"
        />
      ) : (
        cmt.text
      )}
    </p>

{/* Buttons (only for current user) */}
{cmt.is_current_user && canModify(cmt.created_at) && (
  <div className="flex gap-2 pt-1 text-xs text-blue-600">
    {editingId === cmt.id ? (
      <>
        <button onClick={() => handleEdit(cmt.id)}>Save</button>
        <button
          onClick={() => {
            setEditingId(null);
            setEditText("");
          }}
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => {
            setEditingId(cmt.id);
            setEditText(cmt.text);
          }}
        >
          Edit
        </button>
<button onClick={() => setDeleteId(cmt.id)}>Delete</button>
      </>
    )}
  </div>
)}
{/* === Inline Delete Confirmation === */}
<AnimatePresence>
  {deleteId === cmt.id && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="text-xs mt-2 p-2 border border-red-300 bg-red-50 rounded-lg text-red-700"
    >
      <div className="flex gap-3 mt-1">
        <button
          onClick={() => handleDelete(cmt.id)}
          className="text-red-600 font-semibold"
        >
          Yes, delete
        </button>
        <button
          onClick={() => setDeleteId(null)}
          className="text-gray-600"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>

                </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>



          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div className="bg-gray-200 rounded-2xl px-3 py-2 flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 xl:min-w-4xl xl:mx-auto">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition"
        >
          Send
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
