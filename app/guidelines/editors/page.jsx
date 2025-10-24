"use client";

import { motion } from "framer-motion";

export default function EditorGuidelines() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-6 text-center"
      >
        Journivo Editorial Guidelines
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg text-gray-700 mb-8 text-center"
      >
        Journivo editors ensure the integrity, fairness, and quality of the
        publication process. These guidelines outline the responsibilities and
        standards expected of all editors.
      </motion.p>

      <div className="space-y-8">
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Integrity & Fairness</h2>
          <p className="text-gray-700 leading-relaxed">
            Editors must treat all manuscripts impartially, without discrimination
            based on race, gender, institutional affiliation, or personal beliefs.
            Decisions should be based solely on scholarly merit and relevance to
            Journivo’s mission.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Confidentiality</h2>
          <p className="text-gray-700 leading-relaxed">
            Manuscripts and reviewer reports are confidential. Editors must not
            share manuscript content or reviewer identities outside the editorial
            process, unless legally required.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Conflict of Interest</h2>
          <p className="text-gray-700 leading-relaxed">
            Editors must avoid handling manuscripts in which they have financial,
            personal, or professional conflicts. Such manuscripts should be
            reassigned to another editor without delay.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Managing Peer Review</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Select qualified, impartial reviewers with expertise in the subject.</li>
            <li>Ensure the <strong>double-blind process</strong> is strictly followed.</li>
            <li>Monitor review timelines and send reminders when needed.</li>
            <li>Ensure reviewer comments are constructive and professional.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Decision-Making</h2>
          <p className="text-gray-700 leading-relaxed">
            Editorial decisions (Accept, Revise, Reject) should balance reviewer
            feedback, originality, and alignment with journal standards. Editors
            must provide clear, respectful justifications for their decisions.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Ethical Oversight</h2>
          <p className="text-gray-700 leading-relaxed">
            Editors are responsible for addressing ethical concerns such as
            plagiarism, duplicate submissions, fabricated data, or improper
            authorship. Allegations must be investigated promptly and fairly.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Transparency & Accountability</h2>
          <p className="text-gray-700 leading-relaxed">
            Editorial policies and decisions should be transparent. Any changes to
            policies must be communicated clearly to authors, reviewers, and the
            academic community.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Continuous Improvement</h2>
          <p className="text-gray-700 leading-relaxed">
            Editors should actively seek feedback, engage in professional
            development, and adopt best practices to improve the quality and
            efficiency of the journal’s editorial process.
          </p>
        </section>

        {/* Section 9 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact & Support</h2>
          <p className="text-gray-700 leading-relaxed">
            For editorial assistance, please email{" "}
            <a
              href="mailto:editors@journivo.org"
              className="text-blue-600 underline"
            >
              editors@journivo.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
