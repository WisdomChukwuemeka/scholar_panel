// components/PublicationResubmitForm.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicationAPI, PaymentAPI } from "../services/api";
import PaymentModal from "./PaymentModel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  });

  const [errors, setErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBaseData, setPendingBaseData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate 5-second loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }
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
          });
        })
        .catch(() => toast.error("Failed to load publication."))
        .finally(() => setIsLoading(false));
    } else if (initialData?.status !== "rejected") {
      toast.error("Only rejected publications can be resubmitted.");
      router.push(`/publications/${publicationId}`);
    }
  }, [publicationId, initialData, router]);

  /* --------------------------------------------------------------
     Validation
  -------------------------------------------------------------- */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title?.trim() || formData.title.length < 10)
      newErrors.title = "Title must be at least 10 characters.";
    if (!formData.abstract?.trim() || formData.abstract.length < 200)
      newErrors.abstract = "Abstract must be at least 200 characters.";
    if (formData.abstract.length > 2500)
      newErrors.abstract = "Abstract cannot exceed 2500 characters.";
    if (!formData.content?.trim() || formData.content.length < 500)
      newErrors.content = "Content must be at least 500 characters.";
    if (formData.content.length > 15000)
      newErrors.content = "Content cannot exceed 15000 characters.";
    if (!formData.category_name)
      newErrors.category_name = "Category is required.";
    if (formData.file && !/\.(pdf|doc|docx)$/i.test(formData.file.name))
      newErrors.file = "Only PDF, DOC, DOCX allowed.";
    if (
      formData.video_file &&
      !/\.(mp4|avi|mov)$/i.test(formData.video_file.name)
    )
      newErrors.video_file = "Only MP4, AVI, MOV allowed.";
    if (
      formData.keywords &&
      formData.keywords.split(",").filter((k) => k.trim()).length > 20
    )
      newErrors.keywords = "Maximum 20 keywords.";
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
    const allowed = ['title', 'abstract', 'content', 'category_name', 'keywords', 'file', 'video_file'];
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
  const allowed = ['title', 'abstract', 'content', 'category_name', 'keywords', 'file', 'video_file'];
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
    // Non-blocking: don't stop submission
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

  // AUTO-SAVE DRAFT FIRST
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
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">Loading publication...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />

      <h2 className="text-2xl font-bold text-red-700 mb-4">
        Resubmit Publication
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Update any field (title, abstract, content, file, video) before
        resubmitting. You can also save as draft.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length <= 10 ? 
              (<p className="text-red-600">
                {formData.title.length}/10 characters
              </p>) : (<p className="text-green-600">
                {formData.title.length}/10 characters
              </p>)
            }
          </p>
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Abstract
          </label>
          <textarea
            name="abstract"
            value={formData.abstract}
            onChange={handleChange}
            rows={5}
            className="mt-1 block w-full border rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <p
          className={`text-xs mt-1 ${
            formData.abstract.length < 200
              ? 'text-red-600'
              : formData.abstract.length > 2500
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {formData.abstract.length}/2500 characters
          </p>
          {errors.abstract && (
            <p className="text-red-600 text-sm mt-1">{errors.abstract}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            className="mt-1 block w-full border rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <p
            className={`text-xs mt-1 ${
              formData.content.length < 500
                ? 'text-red-600'
                : formData.content.length > 15000
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {formData.content.length}/15000 characters
          </p>
          {errors.content && (
            <p className="text-red-600 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select category</option>
            {CATEGORY_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category_name && (
            <p className="text-red-600 text-sm mt-1">{errors.category_name}</p>
          )}
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            placeholder="e.g. AI, Machine Learning, NLP"
            className="mt-1 block w-full border rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {errors.keywords && (
            <p className="text-red-600 text-sm mt-1">{errors.keywords}</p>
          )}
        </div>

        {/* File */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Updated File (PDF/Word)
          </label>
          <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          />
          {formData.file && (
            <p className="text-sm text-green-600 mt-1">
              Selected: {formData.file.name}
            </p>
          )}
          {errors.file && (
            <p className="text-red-600 text-sm mt-1">{errors.file}</p>
          )}
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Updated Video (optional)
          </label>
          <input
            type="file"
            name="video_file"
            accept=".mp4,.avi,.mov"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          />
          {formData.video_file && (
            <p className="text-sm text-green-600 mt-1">
              Selected: {formData.video_file.name}
            </p>
          )}
          {errors.video_file && (
            <p className="text-red-600 text-sm mt-1">{errors.video_file}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="flex-1 bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 disabled:bg-gray-400 font-medium transition"
          >
            {isSavingDraft ? "Saving..." : "Save as Draft"}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-red-600 text-white py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 font-medium transition"
          >
            {isSubmitting ? "Submitting..." : "Resubmit for Review"}
          </button>
        </div>
      </form>

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