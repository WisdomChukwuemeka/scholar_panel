"use client";

import { useEffect, useState } from "react";
import { PublicationAPI } from "@/app/services/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Book, UserRound } from "lucide-react";

export default function RejectionNotePage({ params }) {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [publication, setPublication] = useState(null);
  const [show404, setShow404] = useState(false);
  const [isLoggin, setIsLoggin] = useState(false);
  const [role, setRole] = useState("")


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
    const fetchData = async () => {
      try {
        const res = await PublicationAPI.get(id);
        const pub = res.data;

        if (pub.status !== "rejected" || !pub.rejection_note) {
          router.push("/404");
          return;
        }

        setPublication(pub);
      } catch (err) {
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

 if (loading || !publication) return null;

  return (
    <section>
        {isLoggin && role === "editor" ? (
            <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold">Rejection Note</h1>

          <h2 className="text-xl mt-4 font-semibold">
            {publication.title}
          </h2>

          <p className="text-sm text-gray-500">By {publication.author}</p>

          <div className="bg-red-50 p-6 mt-6 rounded-xl border border-red-200">
            {publication.rejection_note}
          </div>
        </div>
      </div>
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
    </section>
  );
}
