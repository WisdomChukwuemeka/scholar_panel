"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PublicationAPI, ViewsAPI } from "../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";

export default function PublicationDetail() {
  const router = useRouter();
  const { id } = useParams();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const response = await PublicationAPI.getPublication(id);
        setPublication(response.data);
        console.log("Fetched publication:", response.data);

        // ✅ Fetch user's like/dislike status
        try {
          const viewResponse = await ViewsAPI.detail(id);
          if (viewResponse?.data?.reaction === "like") setLiked(true);
          else if (viewResponse?.data?.reaction === "dislike") setDisliked(true);
        } catch {
          // ignore missing status
        }
      } catch (err) {
        setError("Publication not found.");
        toast.error("Failed to load publication.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPublication();
  }, [id]);

  // --- Like Handler ---
  const handleLike = async () => {
    try {
      await ViewsAPI.like(id);
      toast.success("You liked this publication!");
      setLiked(true);
      setDisliked(false);
      setPublication((prev) => ({
        ...prev,
        total_likes: liked ? prev.total_likes : prev.total_likes + 1,
        total_dislikes: disliked ? prev.total_dislikes - 1 : prev.total_dislikes,
      }));
    } catch {
      toast.error("Failed to like publication.");
    }
  };

  // --- Dislike Handler ---
  const handleDislike = async () => {
    try {
      await ViewsAPI.dislike(id);
      toast.success("You disliked this publication!");
      setDisliked(true);
      setLiked(false);
      setPublication((prev) => ({
        ...prev,
        total_dislikes: disliked ? prev.total_dislikes : prev.total_dislikes + 1,
        total_likes: liked ? prev.total_likes - 1 : prev.total_likes,
      }));
    } catch {
      toast.error("Failed to dislike publication.");
    }
  };

  // --- UI Loading and Error States ---
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium animate-pulse">
            Loading publication...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );

  if (!publication)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-xl">
          <p className="text-gray-600 text-lg">No publication data available.</p>
        </div>
      </div>
    );

  // --- Main Return ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/publications/list" className="hover:text-blue-600 transition-colors">Publications</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Article Detail</span>
          </nav>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Video Section */}
          {publication.video_file ? (
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 p-8">
              <video
                src={publication.video_file}
                controls
                className="w-full rounded-xl shadow-2xl"
                style={{ maxHeight: "500px" }}
                onError={() =>
                  toast.error(`Failed to load video for ${publication.title}`)
                }
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 italic">
              <div className="text-center space-y-3">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">No video file available</p>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="p-8 lg:p-12 space-y-8">
            {/* Title */}
            <div className="space-y-3 border-b border-gray-100 pb-6">
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                Research Article
              </div>
              <h1 className="font-serif text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {publication.title}
              </h1>
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-gray-900">{publication.author}</span>
              </div>
              <div className="flex items-center gap-2">
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h2l2 2h4a2 2 0 012 2v12a2 2 0 01-2 2z" />
  </svg>
  <span className="font-medium text-gray-900">{publication.volume || "Vol. N/A"}</span>
</div>

<div className="flex items-center gap-2 flex-wrap">
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A12.042 12.042 0 0112 15c2.608 0 5.032.835 6.879 2.223M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
  <span className="font-medium text-gray-900">{publication.co_authors?.join(", ") || "No co-authors"}</span>
</div>

              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(publication.publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200">{publication.doi}</span>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-3 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Abstract</h2>
              <p className="text-gray-700 leading-relaxed text-justify">
                {publication.abstract}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3">Content</h2>
              <p className="text-gray-700 text-lg leading-relaxed text-justify whitespace-pre-line">
                {publication.content}
              </p>
            </div>

            {/* Engagement Bar */}
            <div className="flex flex-col items-center justify-between md:items-center md:justify-between md:flex-row gap-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    liked 
                      ? "bg-blue-100 text-blue-700 shadow-sm" 
                      : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                  }`}
                >
                  <ThumbsUp size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">{publication.total_likes}</span>
                </button>

                <button
                  onClick={handleDislike}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    disliked 
                      ? "bg-red-100 text-red-700 shadow-sm" 
                      : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
                  }`}
                >
                  <ThumbsDown size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">{publication.total_dislikes}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/comments/${publication.id}`}>
                  <button className="group flex items-center gap-2 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Discussions</span>
                  </button>
                </Link>
                
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg text-gray-600 shadow-sm">
                  <Eye size={20} />
                  <span className="font-semibold">{publication.views}</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Publication Status:</span>
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
                    publication.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : publication.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : publication.status === "under_review"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {publication.status === "under_review" && (
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {publication.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {publication.status === "rejected" && publication.rejection_note && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6 space-y-2"
                >
                  <div className="flex items-center gap-2 text-red-700 font-bold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Editor's Feedback</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed pl-7">
                    {publication.rejection_note}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>

              {publication.status === "rejected" && (
                <Link href={`/publications/edit/${publication.id}`}>
                  <button className="group flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200">
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit & Resubmit
                  </button>
                </Link>
              )}

              {publication.file && (
                <div className="flex flex-wrap gap-4">
                  {/* Download Button */}
                  {/* <a
                    href={publication.file}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </a> */}

                  {/* Preview Button */}
                  <a
                  href={`https://docs.google.com/gview?url=${encodeURIComponent(publication.file)}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview Online
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}