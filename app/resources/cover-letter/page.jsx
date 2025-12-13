"use client";

import React from "react";

const GoldCard = ({ children }) => (
  <section className="bg-white rounded-3xl shadow-lg border border-[#e7d9b9] p-10 mb-12">
    {children}
  </section>
);

export default function CoverLetterTemplatePage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16 bg-[#f5f0e6]">

      {/* HEADER */}
      <header className="mb-16 text-center bg-white shadow-2xl rounded-3xl py-14 px-10 border-t-8 border-[#d4a64a]">
        <p className="text-sm text-gray-500">Tools & Templates</p>
        <h1 className="text-5xl font-bold tracking-wide text-[#1a1a1a] mt-1">
          Cover Letter Template
        </h1>
        <p className="mt-5 text-gray-700 text-lg max-w-3xl mx-auto">
          Use this template when submitting a manuscript to Scippra. Customize the placeholders with your submission details.
        </p>
      </header>

      <GoldCard>
        <h2 className="text-3xl font-bold mb-5 text-[#1a1a1a]">Cover Letter Template</h2>

        <pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed">
{`[Your Full Name]
[Institution / Affiliation]
[Department]
[Email Address]
[Phone Number]
[City, Country]

[Date]

Editor-in-Chief
Journivo Publishing
[Journal/Section Name]

Dear Editor-in-Chief,

I am pleased to submit our manuscript titled “[Manuscript Title]” for consideration for publication in Journivo. This work is original and has not been published or submitted elsewhere.

In this study, we [briefly summarize novelty, importance, and contribution].

We believe this manuscript is suitable for Journivo because:
• [Point 1]
• [Point 2]
• [Point 3]

All authors have approved the manuscript and declare no conflicts of interest. Data, materials, and methods comply with ethical standards.

Thank you for considering our submission. We look forward to your response.

Sincerely,
[Your Name]
`}
        </pre>
      </GoldCard>
    </main>
  );
}
