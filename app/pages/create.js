"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PublicationAPI, PaymentAPI, CategoryAPI } from "../lib/api";
import PublicationForm from "../components/PublicationForm";

export default function CreatePublication() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    content: "",
    file: null,
    video_file: null,
    category_name: "",
    keywords: "",
    payment_reference: "",
  });

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryAPI.list();
        setCategories(res.data);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();

    const reference = searchParams.get("reference");
    if (reference) {
      setFormData((prev) => ({ ...prev, payment_reference: reference }));
      toast.success("Payment successful! You can now submit your publication.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.payment_reference) {
      try {
        const { data } = await PaymentAPI.initializePayment({
          payment_type: "publication_fee",
        });
        window.location.href = data.authorization_url;
      } catch (err) {
        toast.error("Failed to start payment process.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    try {
      await PublicationAPI.create(data);
      toast.success("Publication submitted successfully!");
      router.push('/');
    } catch (err) {
      toast.error("Failed to submit publication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonText = formData.payment_reference
    ? (isSubmitting ? "Submitting..." : "Submit Publication")
    : (isSubmitting ? "Processing Payment..." : "Pay ₦25,000 & Submit");

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <h1 className="text-2xl font-semibold mb-6 text-center">Create New Publication</h1>
      <PublicationForm
        formData={formData}
        categories={categories}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        buttonText={buttonText}
      />
      <ToastContainer />
    </div>
  );
}