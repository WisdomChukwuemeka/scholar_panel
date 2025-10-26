"use client";
import { useState } from "react";
import authors from "../authorsData";

export default function AuthorsPage() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("A-Z");

  const filteredAuthors = authors
    .filter((author) =>
      author.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "A-Z"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Our Editors</h2>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <input
          type="text"
          placeholder="Search authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="A-Z">Authors A-Z</option>
          <option value="Z-A">Authors Z-A</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredAuthors.map((author) => (
          <div
            key={author.id}
            className="relative group overflow-hidden rounded-xl shadow-md cursor-pointer"
          >
            <img
              src={author.image}
              alt={author.name}
              className="w-full h-56 object-cover transition duration-300 group-hover:scale-110 grayscale group-hover:grayscale-0"
            />
            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-70 text-white py-2 text-center text-sm font-medium">
              {author.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
