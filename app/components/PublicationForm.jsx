"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicationAPI, PaymentAPI, isTokenExpired } from "../services/api";
import PaymentModal from "./PaymentModel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from 'framer-motion'
import {AuthAPI} from '../services/api'

export default function PublicationForm() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    content: "",
    category_name: "",
    keywords: "",
    file: null,
    video_file: null,
    status: "draft",
    cover_image: null,
    volume: "",
    co_authors_input: "",  // Changed to match backend field name
  });
  
  const [errors, setErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPublicationId, setCurrentPublicationId] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CATEGORY_CHOICES = [
    { value: "journal", label: "Journal Article" },
    { value: "conference", label: "Conference Paper" },
    { value: "book", label: "Book/Book Chapter" },
    { value: "thesis", label: "Thesis/Dissertation" },
    { value: "report", label: "Technical Report" },
    { value: "review", label: "Review Paper" },
    { value: "case_study", label: "Case Study" },
    { value: "editorial", label: "Editorial/Opinion" },
    { value: "news", label: "News/Blog" },
    { value: "other", label: "Other" },
  ];

useEffect(() => {
    const checkAuth = async () => {
      try {
        await AuthAPI.me(); // or any endpoint to verify JWT cookie
        setIsAuth(true);
      } catch (err) {
        router.push("/login");
      } finally {
        setHydrated(true);
      }
    };
    checkAuth();
  }, [router]);

  if (!hydrated) return <p>Loading...</p>;
if (!isAuth) return null; // Redirect already handled in useEffect


  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters long.";
    }
    if (!formData.abstract || formData.abstract.length < 200) {
      newErrors.abstract = "Abstract must be at least 200 characters long.";
    }
    if (formData.abstract && formData.abstract.length > 2500) {
      newErrors.abstract = "Abstract cannot exceed 2500 characters.";
    }
    if (!formData.content || formData.content.length < 500) {
      newErrors.content = "Content must be at least 500 characters long.";
    }
    if (formData.content && formData.content.length > 15000) {
      newErrors.content = "Content cannot exceed 15000 characters.";
    }
    if (!formData.category_name) {
      newErrors.category_name = "Category is required.";
    }
    if (formData.file && !formData.file.name.match(/\.(pdf|doc|docx)$/i)) {
      newErrors.file = "Only PDF and Word documents are allowed.";
    }
    if (
      formData.video_file &&
      !formData.video_file.name.match(/\.(mp4|avi|mov)$/i)
    ) {
      newErrors.video_file = "Only MP4, AVI, or MOV video files are allowed.";
    }
    if (formData.keywords && formData.keywords.split(",").length > 20) {
      newErrors.keywords = "Cannot have more than 20 keywords.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

 const buildFormData = () => {
  const data = new FormData();

  // Append all text fields
  Object.keys(formData).forEach((key) => {
    if (formData[key] !== null && formData[key] !== "" && formData[key] !== undefined) {
      if (key !== "file" && key !== "video_file" && key !== "cover_image" && key !== "co_authors_input") {
        data.append(key, formData[key]);
      }
    }
  });

  // Append files
  if (formData.file) data.append("file", formData.file);
  if (formData.video_file) data.append("video_file", formData.video_file);
// Handle cover image upload OR deletion
  if (formData.cover_image instanceof File) {
    data.append("cover_image", formData.cover_image);   // upload
  } else if (formData.cover_image === null) {
    data.append("cover_image", "null");                 // delete
  }


  // Handle co-authors: split and send as multiple values
  if (formData.co_authors_input && formData.co_authors_input.trim()) {
    const coAuthors = formData.co_authors_input
      .split(",")
      .map(name => name.trim())
      .filter(name => name);
    
    coAuthors.forEach(name => {
      data.append("co_authors_input", name);
    });
  }

  return data;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([key, value]) =>
        toast.error(`${key}: ${value}`, { toastId: `validation-${key}` })
      );
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const data = buildFormData();

    try {
      const response = await PublicationAPI.create(data);
      const publication = response.data;
      setCurrentPublicationId(publication.id);

      setFormData({
        ...formData,
        status: publication.status || "draft",
      });

      if (publication.status === "draft") {
        setPendingFormData(data);
        setShowPaymentModal(true);
        toast.success("Publication saved. Please complete payment to submit for review.");
      } else {
        toast.success("Publication created successfully.");
        router.push(`/publications/${publication.id}`);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Failed to create publication.",
        { toastId: "submission-error" }
      );
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (reference) => {
    try {
      const response = await PaymentAPI.verifyPayment(reference);
      if (response.data.payment.status === "success") {
        toast.success("Payment verified. Publication submitted for review.");
        setShowPaymentModal(false);

        const id = currentPublicationId || response.data.payment.metadata.publication_id;
        if (pendingFormData) {
          pendingFormData.append("status", "pending");
          await PublicationAPI.patch(id, pendingFormData);
          setPendingFormData(null);
        }

        router.push(`/publications/${id}`);
      }
    } catch (err) {
      toast.error("Payment verification failed.");
      setShowPaymentModal(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Submit Your Publication
          </h1>
          <p className="text-lg text-gray-600">
            Complete the form below to submit your research for review
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white">Publication Details</h2>
            <p className="text-blue-100 mt-1">All fields marked with * are required</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Section 1: Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                <p className="text-sm text-gray-500 mt-1">Provide the fundamental details of your publication</p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900"
                  placeholder="Enter your publication title"
                  required
                />
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-medium ${
                    formData.title.length < 10 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formData.title.length}/10 minimum characters
                  </p>
                </div>
                {errors.title && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠</span> {errors.title}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORY_CHOICES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category_name && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠</span> {errors.category_name}
                  </p>
                )}
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Keywords
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900"
                  placeholder="e.g., machine learning, neural networks, AI (comma-separated)"
                />
                <p className="text-xs text-gray-500">Separate keywords with commas (maximum 20)</p>
              </div>
            </motion.div>

            {/* Section 2: Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6 pt-6 border-t border-gray-200"
            >
              <div className="border-l-4 border-indigo-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-900">Content Details</h3>
                <p className="text-sm text-gray-500 mt-1">Provide the abstract and full content of your work</p>
              </div>

              {/* Abstract */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 resize-none"
                  rows="5"
                  placeholder="Provide a concise summary of your publication (200-2500 characters)"
                  required
                />
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-medium ${
                    formData.abstract.length < 200 ? 'text-red-600' :
                    formData.abstract.length > 2500 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formData.abstract.length}/2500 characters
                  </p>
                  <p className="text-xs text-gray-500">Minimum 200 characters required</p>
                </div>
                {errors.abstract && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠</span> {errors.abstract}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 resize-none"
                  rows="10"
                  placeholder="Enter the complete content of your publication (500-15000 characters)"
                  required
                />
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-medium ${
                    formData.content.length < 500 ? 'text-red-600' :
                    formData.content.length > 15000 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formData.content.length}/15000 characters
                  </p>
                  <p className="text-xs text-gray-500">Minimum 500 characters required</p>
                </div>
                {errors.content && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠</span> {errors.content}
                  </p>
                )}
              </div>

                            {/* Co-Authors Input */}
 <div className="space-y-2 mt-6">
  <label className="block text-sm font-semibold text-gray-700">
    Co-Authors (Optional)
  </label>
  <input
    type="text"
    name="co_authors_input"
    value={formData.co_authors_input}
    onChange={handleChange}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. John Doe, Jane Smith (comma-separated names)"
  />
  <p className="text-xs text-gray-500">
    Enter co-author names separated by commas.
  </p>
</div>

{/* Volume Input */}
<div className="space-y-2">
  <label className="block text-sm font-semibold text-gray-700">
    Volume (Optional)
  </label>
  <input
    type="text"
    name="volume"
    value={formData.volume}
    onChange={handleChange}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
    focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900"
    placeholder="e.g., Volume 1, Vol. 2"
  />
  <p className="text-xs text-gray-500">Enter the book or journal volume.</p>
</div>

            </motion.div>

            {/* Section 3: File Uploads */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6 pt-6 border-t border-gray-200"
            >
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-900">Supporting Materials</h3>
                <p className="text-sm text-gray-500 mt-1">Upload relevant documents and media files</p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Document File (PDF/Word)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 
                    file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer
                    hover:border-blue-400 transition duration-200"
                  />
                </div>
                <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX</p>
                {errors.file && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠</span> {errors.file}
                  </p>
                )}
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Video File (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="video_file"
                    accept=".mp4,.avi,.mov"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 
                    file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                    file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer
                    hover:border-purple-400 transition duration-200"
                  />
                </div>
                <p className="text-xs text-gray-500">Accepted formats: MP4, AVI, MOV</p>
                {errors.video_file && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠</span> {errors.video_file}
                  </p>
                )}
              </div>



        {/* INSERTED: COVER IMAGE UPLOAD */}
        <div className="space-y-2 mt-6">
          <label className="block text-sm font-semibold text-gray-700">
            Cover Image
          </label>
          <input
            type="file"
            name="cover_image"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 
            file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold 
            file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
          />
          <p className="text-xs text-gray-500">Upload a cover image (JPG, PNG, etc.)</p>
        </div>


            </motion.div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg 
                shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 
                disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed 
                transform transition duration-200 hover:scale-[1.02] active:scale-[0.98]
                flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Save and Submit Publication
                  </>
                )}
              </button>
              <p className="text-xs text-center text-gray-500 mt-4">
                By submitting, you agree to our terms and conditions
              </p>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at <span className="text-blue-600 font-medium">support@journivor.com</span>
          </p>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          publicationId={currentPublicationId}
          paymentType="publication_fee"
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentModal(false);
            setIsSubmitting(false);
          }}
        />
      )}
    </div>
  );
}    