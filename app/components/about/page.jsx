"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        About Journivo
      </motion.h1>

      {/* Intro */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg text-gray-700 leading-relaxed mb-10 text-center"
      >
        Journivo is a digital-first academic publishing platform dedicated to
        empowering researchers, educators, and professionals by providing a
        transparent, accessible, and impactful way to share knowledge with the
        world.
      </motion.p>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white shadow-md rounded-2xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            To advance global scholarship by providing authors, reviewers, and
            editors with a fair, fast, and inclusive publishing experience.
            Journivo bridges the gap between research and real-world impact
            through open access and academic excellence.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white shadow-md rounded-2xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
          <p className="text-gray-700 leading-relaxed">
            To become a trusted hub for knowledge dissemination, where
            high-quality research is freely accessible and scholars worldwide
            can collaborate, learn, and inspire meaningful change.
          </p>
        </motion.div>
      </div>

      {/* Core Values */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-16"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Our Core Values
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-50 shadow-sm rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Integrity</h3>
            <p className="text-gray-600 text-sm">
              We uphold the highest standards of ethics, transparency, and
              accountability in research publishing.
            </p>
          </div>
          <div className="bg-gray-50 shadow-sm rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Collaboration</h3>
            <p className="text-gray-600 text-sm">
              We foster partnerships between authors, reviewers, and editors to
              strengthen knowledge exchange.
            </p>
          </div>
          <div className="bg-gray-50 shadow-sm rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Accessibility</h3>
            <p className="text-gray-600 text-sm">
              We believe knowledge should be open and accessible to all,
              regardless of geography or institution.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Closing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-16 text-center"
      >
        <p className="text-gray-700 text-lg leading-relaxed">
          At Journivo, we are not just a platform—we are a community committed
          to advancing scholarship and shaping the future of academic
          publishing.
        </p>
      </motion.div>
    </div>
  );
}
