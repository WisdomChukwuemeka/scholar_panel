"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicationAPI, PaymentAPI, isTokenExpired } from "../services/api";
import PaymentModal from "./PaymentModel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SecureStorage } from "@/utils/secureStorage";

export default function PublicationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    content: "",
    category_name: "",
    keywords: "",
    file: null,
    video_file: null,
    status: "draft",
  });
  const [errors, setErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPublicationId, setCurrentPublicationId] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Hardcoded Django category options
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters long.";
    }
    if (!formData.abstract || formData.abstract.length < 200) {
      newErrors.abstract = "Abstract must be at least 200 characters long.";
    }
    if (formData.abstract && formData.abstract.length > 1000) {
      newErrors.abstract = "Abstract cannot exceed 1000 characters.";
    }
    if (!formData.content || formData.content.length < 500) {
      newErrors.content = "Content must be at least 500 characters long.";
    }
    if (formData.content && formData.content.length > 10000) {
      newErrors.content = "Content cannot exceed 10000 characters.";
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
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        if (key !== "file" && key !== "video_file") {
          data.append(key, formData[key]);
        }
      }
    });

    if (formData.file) data.append("file", formData.file);
    if (formData.video_file) data.append("video_file", formData.video_file);

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

  const token = SecureStorage.get("access_token");
  if (isTokenExpired(token)) {
    toast.error("Session expired. Please log in again.", { toastId: "session-expired" });
    setIsSubmitting(false);
    router.push("/login");
    return;
  }

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
      // console.error("Submit error:", err.response?.data || err.message);
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
      <h2 className="text-2xl font-semibold mb-4">Create Publication</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Abstract</label>
          <textarea
            name="abstract"
            value={formData.abstract}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            required
          ></textarea>
          {errors.abstract && <p className="text-red-600 text-sm">{errors.abstract}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="6"
            required
          ></textarea>
          {errors.content && <p className="text-red-600 text-sm">{errors.content}</p>}
        </div>

        {/* ✅ Static Category Select */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
            required
          >
            <option value="">Select category</option>
            {CATEGORY_CHOICES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category_name && (
            <p className="text-red-600 text-sm">{errors.category_name}</p>
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
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">File (PDF/Word)</label>
          <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="mt-1 block w-full"
          />
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Video File (MP4/AVI/MOV)
          </label>
          <input
            type="file"
            name="video_file"
            accept=".mp4,.avi,.mov"
            onChange={handleChange}
            className="mt-1 block w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          Save and Submit
        </button>
      </form>

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
