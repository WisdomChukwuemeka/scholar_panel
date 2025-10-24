"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PublicationAPI } from "@/app/services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function PublicationDetail() {
  const router = useRouter();
  const { id } = useParams();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const response = await PublicationAPI.getPublication(id);
        setPublication(response.data);
      } catch (err) {
        setError("Publication not found.");
        toast.error("Failed to load publication.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPublication();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#f5f7f4]">
        <p className="text-gray-600 text-lg animate-pulse">
          Loading publication...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-[#f5f7f4]">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );

  if (!publication)
    return (
      <div className="flex justify-center items-center h-screen bg-[#f5f7f4]">
        <p className="text-gray-600 text-lg">No publication data available.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f5f7f4] py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Left Section - Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          {publication.video_file ? (
            <video
              src={publication.video_file}
              controls
              className="w-full rounded-2xl object-cover"
              style={{ maxHeight: "400px" }}
              onError={() =>
                toast.error(`Failed to load video for ${publication.title}`)
              }
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 italic">
              No video file available.
            </div>
          )}

          <h1 className="font-rubik text-base md:text-[1.5rem] xl:text-[2xl] md:text-5xl font-bold text-gray-900 leading-tight">
            Topic: {publication.title}
          </h1>

          <p>
            <strong>Abstract: </strong>
            <span className="font-poppins text-gray-600 text-lg leading-relaxed">{publication.abstract}</span>
          </p>

          {/* Status Info */}
          <div>
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span
            className={`font-semibold ${
              publication.status === "rejected"
                ? "text-red-600"
                : publication.status === "approved"
                ? "text-green-600"
                : publication.status === "under_review"
                ? "text-orange-500"
                : "text-gray-700"
            }`}
          >
  {publication.status.replace("_", " ")}
</span>

            </p>

            {publication.status === "rejected" && publication.rejection_note && (
              <div className="bg-red-50 border border-red-200 rounded-lg mt-4 p-4">
                <p className="text-red-700 text-sm font-semibold">
                  Editor’s Note:
                </p>
                <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                  {publication.rejection_note}
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => router.back()}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300"
            >
              Back
            </button>

            {publication.status === "rejected" && (
              <Link href={`/publications/edit/${publication.id}`}>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300">
                  Edit & Resubmit
                </button>
              </Link>
            )}

            {publication.file && (
              <a
                href={publication.file}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300"
              >
                View Full PDF
              </a>
            )}
          </div>
        </motion.div>
        
        <p ><strong>Content: </strong><span className="font-poppins text-gray-600 text-lg leading-relaxed">{publication.content}</span></p>


        {/* Right Section - Video or Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl overflow-hidden shadow-lg bg-white"
        >
          
        </motion.div>
      </div>


      {/* Metrics Section (like example image) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-16 flex flex-wrap justify-center gap-8 text-center"
      ></motion.div>
    </div>
  );
}
