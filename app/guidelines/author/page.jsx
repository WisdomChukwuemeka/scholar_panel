"use client";

import { motion } from "framer-motion";

export default function PublishingGuidelines() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-6 text-center"
      >
        Journivo Author Publishing Guidelines
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg text-gray-700 mb-8 text-center"
      >
        Welcome to Journivo. Before submitting your manuscript, please review
        our publishing standards carefully to ensure your work meets our
        requirements.
      </motion.p>

      <div className="space-y-8">
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Scope of Publication</h2>
          <p className="text-gray-700 leading-relaxed">
            Journivo publishes original research, reviews, case studies, and
            commentaries across disciplines. We encourage interdisciplinary
            works that provide new insights and foster academic conversations.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Manuscript Preparation</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Submit manuscripts in <strong>Word (.docx)</strong> or <strong>PDF</strong> format.</li>
            <li>Use a clear academic style (Times New Roman, 12pt, double-spaced).</li>
            <li>Include an abstract (150–250 words).</li>
            <li>Provide 4–6 keywords relevant to your paper.</li>
            <li>Ensure proper referencing (APA, MLA, or Chicago style).</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Authorship & Ethics</h2>
          <p className="text-gray-700 leading-relaxed">
            Authors must ensure originality and avoid plagiarism. All sources
            must be properly cited. Co-authors should meet criteria of
            significant contribution. Conflicts of interest must be disclosed.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Submission Process</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Create an author account on Journivo.</li>
            <li>Upload your manuscript via the submission portal.</li>
            <li>Attach cover letter stating title, author details, and declaration of originality.</li>
            <li>Confirm agreement with Journivo’s publishing policies.</li>
          </ol>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Peer Review</h2>
          <p className="text-gray-700 leading-relaxed">
            All submissions undergo double-blind peer review. Reviewers evaluate
            originality, clarity, methodology, and contribution. Authors may be
            asked to revise and resubmit based on reviewer feedback.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Open Access & Licensing</h2>
          <p className="text-gray-700 leading-relaxed">
            Journivo is committed to open access. Accepted works are published
            under a Creative Commons license, allowing free distribution with
            proper attribution.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Publication Fees</h2>
          <p className="text-gray-700 leading-relaxed">
            A modest publication processing fee applies to accepted papers. Fee
            waivers or reductions may be considered for authors from
            under-resourced institutions.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact & Support</h2>
          <p className="text-gray-700 leading-relaxed">
            For questions or assistance, please email{" "}
            <a
              href="mailto:support@journivo.org"
              className="text-blue-600 underline"
            >
              support@journivo.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
