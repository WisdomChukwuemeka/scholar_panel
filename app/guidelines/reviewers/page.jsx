"use client";

import { motion } from "framer-motion";

export default function ReviewerGuidelines() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-6 text-center"
      >
        Journivo Reviewer Guidelines
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg text-gray-700 mb-8 text-center"
      >
        Thank you for serving as a reviewer for Journivo. Your evaluation helps
        ensure the quality, credibility, and integrity of the research we
        publish.
      </motion.p>

      <div className="space-y-8">
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Confidentiality</h2>
          <p className="text-gray-700 leading-relaxed">
            All manuscripts and reviewer comments are strictly confidential.
            Please do not share, copy, or discuss the content with others
            without permission from the editorial board.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Conflict of Interest</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have a personal, professional, or financial conflict with the
            author(s) or topic, please decline the review or notify the editor
            immediately.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Evaluation Criteria</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Originality of the research and contribution to the field</li>
            <li>Clarity and coherence of writing</li>
            <li>Soundness of methodology and analysis</li>
            <li>Proper referencing and citation of sources</li>
            <li>Relevance to Journivo’s mission and scope</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Review Structure</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>Summary:</strong> Briefly outline the main aim and
              contribution of the paper.
            </li>
            <li>
              <strong>Major Comments:</strong> Identify strengths and critical
              areas for improvement.
            </li>
            <li>
              <strong>Minor Comments:</strong> Note smaller errors, typos, or
              clarifications.
            </li>
            <li>
              <strong>Recommendation:</strong> Accept, Revise, or Reject.
            </li>
          </ol>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Timeliness</h2>
          <p className="text-gray-700 leading-relaxed">
            Reviews should be completed within <strong>2–4 weeks</strong>. If
            more time is needed, please notify the editor as soon as possible.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Constructive Feedback</h2>
          <p className="text-gray-700 leading-relaxed">
            Provide respectful, professional, and specific comments. Reviews
            should help authors strengthen their work, even if the recommendation
            is rejection.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Anonymity</h2>
          <p className="text-gray-700 leading-relaxed">
            Journivo uses a <strong>double-blind review process</strong>. Do not
            include your name or identifying details in the review comments or
            document.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact & Support</h2>
          <p className="text-gray-700 leading-relaxed">
            For assistance with the review process, please email{" "}
            <a
              href="mailto:editorial@journivo.org"
              className="text-blue-600 underline"
            >
              editorial@journivo.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
