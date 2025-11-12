// Styled to match the political multipurpose template (gold/white/black theme)
// JSX ONLY — No TypeScript
"use client"
import React from "react";

const Check = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className || "w-5 h-5"}>
    <path fill="currentColor" d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z" />
  </svg>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 bg-blue-700 text-white font-medium px-4 py-1.5 rounded-full shadow-md">
    <Check className="w-4 h-4" />
    {children}
  </span>
);

const Section = ({ id, title, children }) => (
  <section
    id={id}
    className="bg-white rounded-3xl shadow-lg border border-[#4128cc] p-10 scroll-mt-24"
  >
    <h2 className="text-3xl font-bold mb-5 text-[#1a1a1a] tracking-wide">
      {title}
    </h2>

    <div className="text-gray-700 leading-relaxed space-y-4">{children}</div>
  </section>
);

export default function PlagiarismAndEthicsPolicyPage() {
  const lastUpdated = "2025-11-01";

  const toc = [
    { id: "scope", label: "Scope & Purpose" },
    { id: "definitions", label: "Definitions" },
    { id: "similarity", label: "Similarity Screening" },
    { id: "acceptable-use", label: "Acceptable Reuse & Citation" },
    { id: "self-plagiarism", label: "Self-Plagiarism" },
    { id: "duplicate", label: "Duplicate Submission" },
    { id: "image-data", label: "Image & Data Integrity" },
    { id: "ai-use", label: "Use of Generative AI" },
    { id: "misconduct", label: "Misconduct & Sanctions" },
    { id: "ethics", label: "Research & Publication Ethics" },
    { id: "process", label: "Investigation Process" },
    { id: "appeals", label: "Appeals" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 bg-[#f5f0e6]">

      {/* HERO HEADER */}
      <header className="mb-16 text-center bg-white shadow-2xl rounded-3xl py-14 px-10 border-t-8 border-[#3a37ce]">
        <p className="text-sm text-gray-500">Resources</p>

        <h1 className="text-5xl font-bold tracking-wide text-[#1a1a1a] mt-1">
          Plagiarism & Ethics Policy
        </h1>

        <p className="mt-5 text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
          This policy outlines <em>Journivo</em>&rsquo;s expectations for originality,
          attribution, transparency, and research ethics. All authors must comply
          with these standards before submitting work for review.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Pill>Originality</Pill>
          <Pill>Integrity</Pill>
          <Pill>Transparency</Pill>
        </div>

        <p className="mt-4 text-xs text-gray-500">Last updated: {lastUpdated}</p>
      </header>

      {/* TABLE OF CONTENTS */}
      <nav aria-label="Table of contents" className="mb-14">
        <div className="rounded-3xl bg-white shadow-lg border border-[#e7d9b9] p-8">
          <h2 className="text-xl font-semibold mb-4 text-[#1a1a1a]">
            On this page
          </h2>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block rounded-xl border border-[#4442cf] px-4 py-3 font-medium text-[#1a1a1a] hover:bg-[#5f4ad4] hover:text-white transition shadow-sm"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* CONTENT SECTIONS */}
      <div className="space-y-12">

        {/* 1 */}
        <Section id="scope" title="1) Scope & Purpose">
          <p>
            This policy governs all submissions to Journivo, including original
            articles, reviews, case studies, data papers, and supplementary
            materials such as figures, videos, datasets, and appendices.
          </p>
        </Section>

        {/* 2 */}
        <Section id="definitions" title="2) Definitions">
          <ul className="space-y-3 pl-6 list-disc">
            <li>
              <strong>Plagiarism:</strong> Using another person&rsquo;s ideas, text,
              or data without proper attribution.
            </li>
            <li>
              <strong>Text Recycling:</strong> Reusing one’s own previously
              published content without disclosure.
            </li>
            <li>
              <strong>Fabrication/Falsification:</strong> Creating or manipulating
              data, images, or results.
            </li>
            <li>
              <strong>Image Manipulation:</strong> Altering images in ways that
              misrepresent results.
            </li>
          </ul>
        </Section>

        {/* 3 */}
        <Section id="similarity" title="3) Similarity Screening">
          <p>
            All manuscripts undergo similarity screening using advanced detection
            tools. Editors evaluate similarity results contextually.
          </p>

          <p>
            Generally, similarity above <strong>15–20%</strong> or any large
            single-source match triggers manual investigation.
          </p>
        </Section>

        {/* 4 */}
        <Section id="acceptable-use" title="4) Acceptable Reuse & Citation">
          <ul className="space-y-3 pl-6 list-disc">
            <li>Use quotation marks for any verbatim text.</li>
            <li>Always cite paraphrased ideas or adapted methods.</li>
            <li>Reuse of figures/tables requires permission when applicable.</li>
            <li>Code and datasets require full attribution and licensing details.</li>
          </ul>
        </Section>

        {/* 5 */}
        <Section id="self-plagiarism" title="5) Self-Plagiarism & Redundancy">
          <ul className="space-y-3 pl-6 list-disc">
            <li>Disclose reuse of previously published material.</li>
            <li>Conference papers expanded for publication must cite the original.</li>
            <li>Preprints are allowed but must be referenced.</li>
          </ul>
        </Section>

        {/* 6 */}
        <Section id="duplicate" title="6) Duplicate/Simultaneous Submission">
          <p>
            Manuscripts must not be submitted to multiple journals at the same time.
            Violations may lead to rejection or institutional notification.
          </p>
        </Section>

        {/* 7 */}
        <Section id="image-data" title="7) Image, Figure & Data Integrity">
          <ul className="space-y-3 pl-6 list-disc">
            <li>No manipulation that misrepresents results.</li>
            <li>Raw data must be provided if requested.</li>
            <li>All image adjustments must be described in the Methods section.</li>
          </ul>
        </Section>

        {/* 8 */}
        <Section id="ai-use" title="8) Use of Generative AI">
          <ul className="space-y-3 pl-6 list-disc">
            <li>AI tools may assist in grammar and clarity only.</li>
            <li>All AI use must be disclosed.</li>
            <li>AI tools may not generate ideas, data, or conclusions.</li>
            <li>AI systems cannot be listed as authors.</li>
          </ul>
        </Section>

        {/* 9 */}
        <Section id="misconduct" title="9) Misconduct & Sanctions">
          <p>
            Verified plagiarism, data manipulation, or ethical violations may lead
            to rejection, retraction, or extended publication bans.
          </p>
        </Section>

        {/* 10 */}
        <Section id="ethics" title="10) Research & Publication Ethics">
          <ul className="space-y-3 pl-6 list-disc">
            <li>All authors must contribute substantially to the work.</li>
            <li>Conflicts of interest must be acknowledged.</li>
            <li>Human and animal research requires compliance approval.</li>
            <li>Reviewers must remain confidential and unbiased.</li>
          </ul>
        </Section>

        {/* 11 */}
        <Section id="process" title="11) Investigation Process">
          <ol className="space-y-3 pl-6 list-decimal">
            <li>Initial screening by editors.</li>
            <li>Formal request for explanation or raw materials.</li>
            <li>Decision: accept, revise, reject, retract, or escalate.</li>
            <li>Documentation of all steps.</li>
          </ol>
        </Section>

        {/* 12 */}
        <Section id="appeals" title="12) Appeals">
          <p>
            Authors may appeal editorial decisions within 30 days by providing
            evidence and justification. Appeals are evaluated by independent editors.
          </p>
        </Section>

        {/* 13 */}
        <Section id="contact" title="13) Contact">
          <p>
            Questions about this policy may be directed to the editorial office at{" "}
            <a href="mailto:editorial@journivo.example" className="underline text-[#d4a64a]">
              editorial@journivo.example
            </a>.
          </p>
        </Section>
      </div>

    
    </main>
  );
}
