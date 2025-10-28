"use client";

import { useState } from "react";
import { CommentAPI } from "@/app/services/api"; // Adjust the import path as needed
import { toast } from "react-toastify"; // Assuming react-toastify is installed for notifications

export default function NewCommentForm({ publicationId, onCommentAdded }) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.warning("Comment cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await CommentAPI.create(publicationId, { text: newComment });
      if (onCommentAdded) {
        onCommentAdded(response.data); // Callback to add the new comment to the list
      }
      setNewComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-5 border border-gray-100">
      <textarea
        rows="4"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write your comment..."
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      ></textarea>
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
      >
        {submitting ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}