"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommentAPI } from "@/app/services/api";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

export default function NewCommentForm({ onCommentAdded, parentId = null }) {
  const { publicationId } = useParams(); // ← string UUID from URL
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // === Fetch comments ===
  useEffect(() => {
    if (!publicationId) return;

    const fetchComments = async () => {
      try {
        const response = await CommentAPI.list(publicationId);
        const data = response.data.results || response.data || [];
        setComments(data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        toast.error("Failed to load comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [publicationId]);

  // === Auto-scroll to bottom ===
  useEffect(() => {
    if (chatEndRef.current && !isTyping) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, isTyping]);

  // === Typing indicator ===
  useEffect(() => {
    if (!newComment.trim()) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const timeout = setTimeout(() => setIsTyping(false), 2000);
    return () => clearTimeout(timeout);
  }, [newComment]);

  // === Submit new comment ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return toast.warning("Comment cannot be empty.");

    setSubmitting(true);
    setIsTyping(false);

    try {
      const data = { text: newComment };
      if (parentId) data.parent = parentId;

      const response = await CommentAPI.create(publicationId, data);
      const newCommentObj = {
        ...response.data,
        author_name: "You",
        created_at: new Date().toISOString(),
      };

      setComments((prev) => [...prev, newCommentObj]);
      setNewComment("");
      toast.success("Comment sent!");
      onCommentAdded?.(newCommentObj);
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // === Format time ===
  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // === Delete ===
  const handleDeleteClick = (id) => setDeleteConfirmId(id);
  const handleDeleteCancel = () => setDeleteConfirmId(null);

  const handleDeleteConfirm = async (commentId) => {
    try {
      await CommentAPI.delete(publicationId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setDeleteConfirmId(null);
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete comment");
    }
  };

  // === Edit ===
  const handleEditStart = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEditSave = async (commentId) => {
    if (!editText.trim()) return toast.warning("Comment cannot be empty.");

    try {
      const response = await CommentAPI.update(publicationId, commentId, { text: editText });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, text: response.data.text } : c))
      );
      toast.success("Comment updated!");
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update comment");
    }
  };

  // === Render ===
  return (
    <div className="max-w-2xl w-fit mx-auto  bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Discussion</h2>

      {/* Chat Area */}
      <div className="h-96 overflow-y-auto p-3 bg-white/70 rounded-xl border border-gray-200 shadow-inner flex flex-col">
        {loading && <p className="text-gray-500 text-center">Loading comments...</p>}

        {!loading && comments.length === 0 && (
          <p className="text-gray-400 text-center text-sm">
            No comments yet. Be the first to start the conversation
          </p>
        )}

        <div className="flex flex-col space-y-4">
          <AnimatePresence>
            {comments.map((cmt) => {
              const isCurrentUser = cmt.author_name === "You";
              return (
                <motion.div
                  key={cmt.id}
                  className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Avatar (other user) */}
                  {!isCurrentUser && (
                    <div className="flex-shrink-0 bg-indigo-200 text-indigo-800 w-8 h-8 flex items-center justify-center rounded-full font-semibold">
                      {cmt.author_name?.[0]?.toUpperCase() || "A"}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                      isCurrentUser
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {/* Edit Mode */}
                    {editingId === cmt.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className={`w-full text-sm rounded-xl p-2 border focus:outline-none ${
                            isCurrentUser ? "text-gray-800 border-indigo-300" : "text-gray-800 border-gray-300"
                          }`}
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleEditCancel}
                            className="text-xs px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSave(cmt.id)}
                            className="text-xs px-2 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : deleteConfirmId === cmt.id ? (
                      /* Delete Confirm */
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm flex flex-col gap-2"
                      >
                        <p className="text-center">Delete this comment?</p>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleDeleteConfirm(cmt.id)}
                            className="px-3 py-1 text-xs rounded-md bg-red-500 hover:bg-red-600 text-white"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            className="px-3 py-1 text-xs rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      /* Normal View */
                      <>
                        <div className="flex justify-between items-start">
                          <p className="text-sm leading-snug flex-1 break-words">{cmt.text}</p>
                          {isCurrentUser && (
                            <div className="ml-2 flex items-center gap-1 text-xs">
                              <button
                                onClick={() => handleEditStart(cmt)}
                                className="text-indigo-100 hover:text-yellow-200 transition"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(cmt.id)}
                                className="text-indigo-100 hover:text-red-300 transition"
                                title="Delete"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        <div
                          className={`flex justify-between mt-1 text-xs gap-3 ${
                            isCurrentUser ? "text-indigo-100" : "text-gray-600"
                          }`}
                        >
                          <span>{cmt.author_name}</span>
                          <span>{formatTime(cmt.created_at)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Avatar (current user) */}
                  {isCurrentUser && (
                    <div className="flex-shrink-0 bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-semibold">
                      {cmt.author_name?.[0]?.toUpperCase() || "Y"}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              className="flex items-center gap-2 justify-start mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex-shrink-0 bg-indigo-200 text-indigo-800 w-8 h-8 flex items-center justify-center rounded-full font-semibold">
                A
              </div>
              <div className="bg-gray-200 text-gray-800 rounded-2xl px-3 py-2 shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-all disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}