"use client";
import { useState } from "react";
import { PublicationAPI } from "../services/api"; // import your API wrapper
import { toast, ToastContainer } from "react-toastify";

export default function PublicationForm() {
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    content: "",
    category_ids: [],
    file: null,
  });

  const [categories, setCategories] = useState([]); // optional if you fetch categories

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData({ ...formData, category_ids: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare FormData object for file + text
    const data = new FormData();
    data.append("title", formData.title);
    data.append("abstract", formData.abstract);
    data.append("content", formData.content);
    if (formData.file) data.append("file", formData.file);
    formData.category_ids.forEach((id) => data.append("category_ids", id));

    try {
      const response = await PublicationAPI.create(data);
      toast.success("Publication created successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error creating publication:", error.response?.data || error.message);

      // Show backend validation errors one after another
      if (error.response?.data) {
        const errors = error.response.data;
        for (const key in errors) {
          if (Array.isArray(errors[key])) {
            errors[key].forEach((msg, idx) => {
              setTimeout(() => toast.error(`${key}: ${msg}`), idx * 1000);
            });
          } else {
            toast.error(`${key}: ${errors[key]}`);
          }
        }
      } else {
        toast.error("Something went wrong, try again.");
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">New Publication</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="abstract"
          value={formData.abstract}
          onChange={handleChange}
          placeholder="Abstract"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Content"
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          name="file"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <select
          multiple
          value={formData.category_ids}
          onChange={handleCategoryChange}
          className="w-full border p-2 rounded"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
