"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommentAPI, PointRewardAPI } from "@/app/services/api";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

export default function NewCommentForm({ onCommentAdded, parentId = null }) {
  const { publicationId } = useParams();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const chatEndRef = useRef(null);

  // === Fetch comments + points ===
  const fetchComments = async () => {
    if (!publicationId) return;
    try {
      const response = await CommentAPI.list(publicationId);
      const data = response.data.results || response.data || [];

      // Compare with current comments before updating
      if (
        data.length !== comments.length ||
        JSON.stringify(data[data.length - 1]) !== JSON.stringify(comments[comments.length - 1])
      ) {
        setComments(data);
      }

      // Refresh total points if changed
      const pointsRes = await PointRewardAPI.list(publicationId);
      const pointsData = pointsRes.data.results || pointsRes.data || [];
      const total = pointsData.reduce((sum, r) => sum + (r.points || 0), 0);
      if (total !== totalPoints) setTotalPoints(total);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // === Initial load + Polling ===
  useEffect(() => {
  if (!publicationId) return;
  fetchComments(); // initial fetch

  const intervalId = setInterval(() => {
    if (!isTyping) fetchComments(); // only fetch when not typing
  }, 10000); // every 10s

  return () => clearInterval(intervalId);
}, [publicationId, isTyping]); //  fixed dependencies


  // === Typing indicator ===
  useEffect(() => {
    if (!newComment.trim()) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const timeout = setTimeout(() => setIsTyping(false), 5000);
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

      // Refresh points
      const pointsRes = await PointRewardAPI.list(publicationId);
      const pointsData = pointsRes.data.results || pointsRes.data || [];
      const total = pointsData.reduce((sum, r) => sum + (r.points || 0), 0);
      setTotalPoints(total);
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // === Format time ===
  const formatTime = (isoString) =>
    isoString
      ? new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

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

  // === Medal logic ===
  let medalImage = null;
  if (totalPoints >= 5000) medalImage = "/rewardimage/gold.png";
  else if (totalPoints >= 2500) medalImage = "/rewardimage/silver.png";
  else if (totalPoints >= 1000) medalImage = "/rewardimage/bronze.png";

  // === Render ===
  return (
    <div className="text max-w-2xl w-full mx-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="flex justify-between text-xl font-semibold mb-4 text-gray-800 items-center gap-2 pt-2 px-2">
        Discussion
        <span className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full flex items-center">
          ⭐ {totalPoints} points
          {medalImage && <img src={medalImage} alt="Medal" className="w-4 h-4 ml-1" />}
        </span>
      </h2>

      {/* Chat Area */}
      <div className="h-96 md:h-200 overflow-y-auto p-3 bg-white/70 rounded-xl border border-gray-200 shadow-inner flex flex-col">
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
                  {!isCurrentUser && (
                    <div className="flex-shrink-0 bg-indigo-200 text-indigo-800 w-8 h-8 flex items-center justify-center rounded-full font-semibold">
                      {cmt.author_name?.[0]?.toUpperCase() || "A"}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                      isCurrentUser
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {editingId === cmt.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full text-sm rounded-xl p-2 border focus:outline-none border-indigo-300 text-gray-800"
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
                      <>
                        <div className="flex justify-between items-start">
                          <p className="text-sm leading-snug flex-1 break-words">{cmt.text}</p>
                          {isCurrentUser && (
                            <div className="ml-2 flex items-center gap-1 text-xs">
                              <button
                                onClick={() => handleEditStart(cmt)}
                                className="text-indigo-100 hover:text-yellow-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(cmt.id)}
                                className="text-indigo-100 hover:text-red-300"
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
                  {isCurrentUser && (
                    <div className="flex-shrink-0 bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-semibold">
                      {cmt.author_name?.[0]?.toUpperCase() || "Y"}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
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
