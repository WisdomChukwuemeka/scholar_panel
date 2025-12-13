// components/PublicationResubmitForm.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicationAPI, PaymentAPI } from "../services/api";
import PaymentModal from "./PaymentModel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from 'framer-motion'

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

export default function PublicationResubmitForm({
  publicationId: propPublicationId,
  initialData,
}) {
  const router = useRouter();
  const params = useSearchParams();
  const publicationId = propPublicationId || params.get("publicationId");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    abstract: initialData?.abstract || "",
    content: initialData?.content || "",
    category_name: initialData?.category?.name || "",
    keywords: initialData?.keywords || "",
    file: null,
    video_file: null,
    cover_image: null,
    volume: initialData?.volume || "",
     co_authors_input: initialData?.co_authors || "",  // Changed to match backend
  });

  const [errors, setErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBaseData, setPendingBaseData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* --------------------------------------------------------------
     Load publication (if not passed as prop)
  -------------------------------------------------------------- */
  useEffect(() => {
    if (!initialData && publicationId) {
      setIsLoading(true);
      PublicationAPI.get(publicationId)
        .then((res) => {
          const pub = res.data;
          if (pub.status !== "rejected") {
            toast.error("Only rejected publications can be resubmitted.");
            router.push(`/publications/${publicationId}`);
            return;
          }
          setFormData({
            title: pub.title,
            abstract: pub.abstract,
            content: pub.content,
            category_name: pub.category?.name || "",
            keywords: pub.keywords || "",
            file: null,
            video_file: null,
            cover_image: null,
            co_authors_input: pub.co_authors,
            volume: pub.volume || "",
          });
        })
        .catch(() => toast.error("Failed to load publication."))
        .finally(() => setIsLoading(false));
    } else if (initialData?.status !== "rejected") {
      toast.error("Only rejected publications can be resubmitted.");
      router.push(`/publications/${publicationId}`);
    }
  }, [publicationId, initialData, router]);


  const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  /* --------------------------------------------------------------
     Validation
  -------------------------------------------------------------- */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title?.trim() || formData.title.length < 10)
      newErrors.title = "Title must be at least 10 characters.";
    const abstractWords = countWords(formData.abstract);
    if (!formData.abstract || abstractWords < 200) {
        newErrors.abstract = "Abstract must be at least 200 words.";
    }
    if (abstractWords > 250) {
        newErrors.abstract = "Abstract cannot exceed 250 words.";
    }    
    const contentWords = countWords(formData.content);
    if (!formData.content || contentWords < 1000) {
        newErrors.content = "Content must be at least 1000 words.";
    }    
    if (!formData.category_name)
      newErrors.category_name = "Category is required.";
    if (formData.file && !/\.(pdf|doc|docx)$/i.test(formData.file.name))
      newErrors.file = "Only PDF, DOC, DOCX allowed.";
    if (
      formData.video_file &&
      !/\.(mp4|avi|mov)$/i.test(formData.video_file.name)
    )
      newErrors.video_file = "Only MP4, AVI, MOV allowed.";
   
    if (formData.keywords && formData.keywords.split(",").length > 10) {
    newErrors.keywords = "Cannot have more than 10 keywords.";
  }

    if (formData.cover_image && !/\.(jpg|jpeg|png|webp)$/i.test(formData.cover_image.name))
      newErrors.cover_image = "Only JPG, JPEG, PNG, WEBP allowed.";

    if (formData.co_authors_input && formData.co_authors_input.length > 300)
      newErrors.co_authors_input = "Co-author list cannot exceed 300 characters.";
    if (formData.volume && formData.volume.length > 20)
      newErrors.volume = "Volume text is too long.";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const buildBaseFormData = () => {
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined) data.append(k, v);
    });
    return data;
  };

  /* --------------------------------------------------------------
     Save as Draft
  -------------------------------------------------------------- */
const handleSaveDraft = async () => {
  setIsSavingDraft(true);
  try {
    const payload = new FormData();
    const allowed = ['title', 'abstract', 'content', 'category_name', 'keywords', 'file', 'video_file', "cover_image",
  "co_authors_input", "volume"];
    allowed.forEach(key => {
      const value = formData[key];
      if (value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });

    await PublicationAPI.patch(publicationId, payload);
    toast.success("Saved as draft");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.detail || "Failed to save draft");
  } finally {
    setIsSavingDraft(false);
  }
};

/* --------------------------------------------------------------
   Auto-save draft before any resubmit
-------------------------------------------------------------- */
const saveDraftBeforeSubmit = async () => {
  const draftPayload = new FormData();
  const allowed = ['title', 'abstract', 'content', 'category_name', 'keywords', 'file', 'video_file', "cover_image",
  "co_authors_input", "volume"];
  allowed.forEach(key => {
    const value = formData[key];
    if (value !== null && value !== undefined) {
      draftPayload.append(key, value);
    }
  });

  try {
    await PublicationAPI.patch(publicationId, draftPayload);
    toast.success("Draft saved automatically.");
  } catch (err) {
    console.warn("Auto-save draft failed (non-blocking):", err);
  }
};

/* --------------------------------------------------------------
   Submit to free review OR payment modal
-------------------------------------------------------------- */
const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setIsSubmitting(true);

  if (!publicationId) {
    toast.error("Publication ID missing.");
    setIsSubmitting(false);
    return;
  }

  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length) {
    setErrors(validationErrors);
    Object.values(validationErrors).forEach((msg) => toast.error(msg));
    setIsSubmitting(false);
    return;
  }

  const baseData = buildBaseFormData();

  await saveDraftBeforeSubmit();

  try {
    const freeRes = await PaymentAPI.getFreeReviewStatus();
    const hasFree = freeRes.data.has_free_review_available;

    if (hasFree) {
      const payload = new FormData();
      for (const [k, v] of baseData.entries()) payload.append(k, v);
      payload.append("status", "pending");
      payload.append("is_free_review", "true");

      await PublicationAPI.patch(publicationId, payload);
      toast.success("Resubmitted! Now pending review.");
      router.push(`/publications/${publicationId}`);
    } else {
      const clean = new FormData();
      for (const [k, v] of baseData.entries()) clean.append(k, v);
      setPendingBaseData(clean);
      setShowPaymentModal(true);
    }
  } catch (err) {
    const msg = err.response?.data?.detail || "Resubmission failed.";
    toast.error(msg);
  } finally {
    setIsSubmitting(false);
  }
};

  /* --------------------------------------------------------------
     Payment success → final PATCH
  -------------------------------------------------------------- */
  const handlePaymentSuccess = async (reference) => {
    try {
      const verifyRes = await PaymentAPI.verifyPayment(reference);
      if (verifyRes.data.payment?.status !== "success") {
        throw new Error("Payment not successful");
      }

      const finalPayload = new FormData();
      for (const [k, v] of pendingBaseData.entries()) finalPayload.append(k, v);
      finalPayload.append("status", "pending");
      finalPayload.append("is_free_review", "false");

      await PublicationAPI.patch(publicationId, finalPayload);

      toast.success("Payment confirmed. Resubmitted for review.");
      router.push(`/publications/${publicationId}`);
    } catch (err) {
      console.error(err);
      toast.error("Payment failed or update unsuccessful.");
    } finally {
      setShowPaymentModal(false);
      setPendingBaseData(null);
    }
  };

  /* --------------------------------------------------------------
     UI
  -------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading publication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Resubmit Your Publication
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review and update your rejected publication before resubmitting for another review
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-red-600 to-orange-600 mx-auto rounded-full"></div>
        </div>

        {/* Alert Box */}
        <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4 shadow-sm">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Important Notice</h3>
              <p className="text-sm text-amber-700 mt-1">
                Update any fields (title, abstract, content, files, video) based on reviewer feedback before resubmitting. 
                You can save as draft to continue later.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white">Update Publication Details</h2>
            <p className="text-red-100 mt-1">Make necessary changes based on reviewer feedback</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Section 1: Core Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="border-l-4 border-red-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900">Core Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Update the essential details of your publication</p>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-gray-900"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Select a category</option>
                      {CATEGORY_CHOICES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
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
                      placeholder="e.g., AI, Machine Learning, NLP (comma-separated)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-gray-900"
                    />
                    <p className="text-xs text-gray-500">Separate keywords with commas (maximum 10)</p>
                    {errors.keywords && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <span>⚠</span> {errors.keywords}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Section 2: Content Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-6 pt-6 border-t border-gray-200"
                >
                  <div className="border-l-4 border-orange-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900">Content Revisions</h3>
                    <p className="text-sm text-gray-500 mt-1">Revise your abstract and content based on feedback</p>
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
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-gray-900 resize-none"
                      placeholder="Provide a revised summary of your publication (200-2500 characters)"
                      required
                    />
                    <div className="flex justify-between items-center">
                       <p className={`text-xs font-medium ${
                    countWords(formData.abstract) < 200 || countWords(formData.abstract) > 250
                      ? "text-red-600"
                      : "text-green-600"
                  }`}>
                    {countWords(formData.abstract)} words (200–250 required)
                  </p>
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
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-gray-900 resize-none"
                      placeholder="Enter the revised complete content of your publication (500-15000 characters)"
                      required
                    />
                    <div className="flex justify-between items-center">
                      <p className={`text-xs font-medium ${
                  countWords(formData.content) < 1000
                    ? "text-red-600"
                    : "text-green-600"
                }`}>
                  {countWords(formData.content)} words (minimum 1000 required)
                </p>
                </div>
                {errors.content && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠</span> {errors.content}
                  </p>
                    )}
                  </div>

                  {/* Co-author */}
<div className="space-y-2">
  <label className="block text-sm font-semibold text-gray-700">
    Co-Authors (comma-separated)
  </label>

  <input
    type="text"
    name="co_authors_input"
    value={formData.co_authors_input}
    onChange={handleChange}
    placeholder="e.g., John Doe, Jane Smith"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
    focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-gray-900"
  />

  {errors.co_authors_input && (
    <p className="text-red-600 text-sm flex items-center gap-1">
      <span>⚠</span> {errors.co_authors_input}
    </p>
  )}
</div>


{/* Volume */}
<div className="space-y-2">
  <label className="block text-sm font-semibold text-gray-700">
    Volume / Version
  </label>
  <input
    type="text"
    name="volume"
    value={formData.volume}
    onChange={handleChange}
    placeholder="e.g., Volume 1, Vol. 2, Edition 3"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
    focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-gray-900"
  />
  {errors.volume && (
    <p className="text-red-600 text-sm flex items-center gap-1">
      <span>⚠</span> {errors.volume}
    </p>
  )}
</div>

                </motion.div>

                {/* Section 3: File Updates */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6 pt-6 border-t border-gray-200"
                >
                  <div className="border-l-4 border-purple-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900">Updated Files</h3>
                    <p className="text-sm text-gray-500 mt-1">Upload revised documents and media files</p>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Updated Document (PDF/Word)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 
                        file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                        file:bg-red-50 file:text-red-700 hover:file:bg-red-100 file:cursor-pointer cursor-pointer
                        hover:border-red-400 transition duration-200"
                      />
                    </div>
                    {formData.file && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selected: {formData.file.name}
                      </div>
                    )}
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
                      Updated Video File (Optional)
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
                    {formData.video_file && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selected: {formData.video_file.name}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Accepted formats: MP4, AVI, MOV</p>
                    {errors.video_file && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <span>⚠</span> {errors.video_file}
                      </p>
                    )}
                  </div>


                  {/* Cover Image Upload */}
<div className="space-y-2">
  <label className="block text-sm font-semibold text-gray-700">
    Cover Image (JPG/PNG/WEBP)
  </label>

  <input
    type="file"
    name="cover_image"
    accept=".jpg,.jpeg,.png,.webp"
    onChange={handleChange}
    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 
    file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold 
    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer
    hover:border-blue-400 transition duration-200"
  />

  {formData.cover_image && (
    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Selected: {formData.cover_image.name}
    </div>
  )}

  {errors.cover_image && (
    <p className="text-red-600 text-sm flex items-center gap-1">
      <span>⚠</span> {errors.cover_image}
    </p>
  )}
</div>

                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="pt-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-4 px-6 rounded-lg 
                      shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800
                      disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed 
                      transform transition duration-200 hover:scale-[1.02] active:scale-[0.98]
                      flex items-center justify-center gap-2"
                    >
                      {isSavingDraft ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving Draft...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          Save as Draft
                        </>
                      )}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold py-4 px-6 rounded-lg 
                      shadow-lg hover:shadow-xl hover:from-red-700 hover:to-orange-700
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
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Resubmit for Review
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Your publication will be reviewed again once resubmitted
                  </p>
                </motion.div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          publicationId={publicationId}
          paymentType="review_fee"
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}