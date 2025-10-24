"use client";

export default function ResourcesPage() {
  return (
    <section className="bg-gray-50 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Page Heading */}
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Resources
        </h2>
        <p className="text-center text-lg text-gray-600 mb-12">
          Explore essential tools, templates, and guidelines to support authors, reviewers, and editors 
          throughout the publishing process at Journivo.
        </p>

        {/* Resource Categories */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Author Resources */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Authors</h3>
            <ul className="text-gray-600 space-y-2">
              <li>📄 <a href="#" className="text-blue-600 hover:underline">Manuscript Template</a></li>
              <li>📑 <a href="#" className="text-blue-600 hover:underline">Submission Guidelines</a></li>
              <li>📘 <a href="#" className="text-blue-600 hover:underline">Formatting Instructions</a></li>
              <li>🖊️ <a href="#" className="text-blue-600 hover:underline">Plagiarism Policy</a></li>
            </ul>
          </div>

          {/* Reviewer Resources */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Reviewers</h3>
            <ul className="text-gray-600 space-y-2">
              <li>📄 <a href="#" className="text-blue-600 hover:underline">Reviewer Guidelines</a></li>
              <li>✅ <a href="#" className="text-blue-600 hover:underline">Review Checklist</a></li>
              <li>📘 <a href="#" className="text-blue-600 hover:underline">Ethics in Peer Review</a></li>
              <li>📊 <a href="#" className="text-blue-600 hover:underline">Evaluation Form</a></li>
            </ul>
          </div>

          {/* Editor Resources */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Editors</h3>
            <ul className="text-gray-600 space-y-2">
              <li>📘 <a href="#" className="text-blue-600 hover:underline">Editorial Policies</a></li>
              <li>📑 <a href="#" className="text-blue-600 hover:underline">Best Practices</a></li>
              <li>⚖️ <a href="#" className="text-blue-600 hover:underline">Ethical Standards</a></li>
              <li>📝 <a href="#" className="text-blue-600 hover:underline">Decision Letter Templates</a></li>
            </ul>
          </div>

          {/* Open Access & Publishing Policies */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Open Access & Policies</h3>
            <ul className="text-gray-600 space-y-2">
              <li>🌍 <a href="#" className="text-blue-600 hover:underline">Open Access Policy</a></li>
              <li>🔒 <a href="#" className="text-blue-600 hover:underline">Copyright & Licensing</a></li>
              <li>🖊️ <a href="#" className="text-blue-600 hover:underline">Plagiarism & Ethics</a></li>
              <li>📄 <a href="#" className="text-blue-600 hover:underline">Retraction Policy</a></li>
            </ul>
          </div>

          {/* Tools & Templates */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tools & Templates</h3>
            <ul className="text-gray-600 space-y-2">
              <li>📝 <a href="#" className="text-blue-600 hover:underline">Cover Letter Template</a></li>
              <li>📊 <a href="#" className="text-blue-600 hover:underline">Data Sharing Policy</a></li>
              <li>📄 <a href="#" className="text-blue-600 hover:underline">Conflict of Interest Form</a></li>
              <li>📘 <a href="#" className="text-blue-600 hover:underline">Acknowledgement Guidelines</a></li>
            </ul>
          </div>

          {/* FAQs */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">FAQs</h3>
            <ul className="text-gray-600 space-y-2">
              <li>❓ <a href="#" className="text-blue-600 hover:underline">How do I submit a paper?</a></li>
              <li>❓ <a href="#" className="text-blue-600 hover:underline">What is the review process?</a></li>
              <li>❓ <a href="#" className="text-blue-600 hover:underline">How much does it cost?</a></li>
              <li>❓ <a href="#" className="text-blue-600 hover:underline">How long does publishing take?</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
