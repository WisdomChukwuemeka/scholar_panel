// Open Access Policy — Styled in the gold/white political multipurpose template style
// JSX ONLY — No TypeScript
"use client"
import React from "react";

const Check = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className || "w-5 h-5"}>
    <path fill="currentColor" d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z" />
  </svg>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 bg-[#d4a64a] text-white font-medium px-4 py-1.5 rounded-full shadow-md">
    <Check className="w-4 h-4" />
    {children}
  </span>
);

const Section = ({ id, title, children }) => (
  <section
    id={id}
    className="bg-white rounded-3xl shadow-lg border border-[#e7d9b9] p-10 scroll-mt-24"
  >
    <h2 className="text-3xl font-bold mb-5 text-[#1a1a1a] tracking-wide">{title}</h2>
    <div className="text-gray-700 leading-relaxed space-y-4">{children}</div>
  </section>
);

export default function OpenAccessPolicyPage() {
  const lastUpdated = "2025-11-01";

  const toc = [
    { id: "about", label: "About This Policy" },
    { id: "principles", label: "Open Access Principles" },
    { id: "licensing", label: "Licensing & Copyright" },
    { id: "author-rights", label: "Author Rights" },
    { id: "repository", label: "Repository & Archiving" },
    { id: "fees", label: "Publication Fees" },
    { id: "ethics", label: "Ethics & Transparency" },
    { id: "reuse", label: "Reuse & Distribution" },
    { id: "compliance", label: "Funders & Compliance" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 bg-[#f5f0e6]">

      {/* HEADER */}
      <header className="mb-16 text-center bg-white shadow-2xl rounded-3xl py-14 px-10 border-t-8 border-[#d4a64a]">
        <p className="text-sm text-gray-500">Resources</p>

        <h1 className="text-5xl font-bold tracking-wide text-[#1a1a1a] mt-1">
          Open Access Policy
        </h1>

        <p className="mt-5 text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
          Journivo is committed to providing unrestricted and equitable access to scholarly research. 
          Our Open Access Policy ensures global dissemination, transparency, and the free exchange of knowledge.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Pill>Accessibility</Pill>
          <Pill>Freedom</Pill>
          <Pill>Knowledge</Pill>
        </div>

        <p className="mt-4 text-xs text-gray-500">Last updated: {lastUpdated}</p>
      </header>

      {/* TABLE OF CONTENTS */}
      <nav aria-label="Table of contents" className="mb-14">
        <div className="rounded-3xl bg-white shadow-lg border border-[#e7d9b9] p-8">
          <h2 className="text-xl font-semibold mb-4 text-[#1a1a1a]">On this page</h2>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block rounded-xl border border-[#d4a64a] px-4 py-3 font-medium text-[#1a1a1a] hover:bg-[#d4a64a] hover:text-white transition shadow-sm"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* SECTIONS */}
      <div className="space-y-12">

        <Section id="about" title="1) About This Policy">
          <p>
            Journivo supports full Open Access publishing, meaning all articles are freely 
            available without subscription or paywall barriers. Our mission is to promote global 
            access to academic knowledge, enabling researchers, policymakers, educators, and 
            the public to benefit without limitation.
          </p>
        </Section>

        <Section id="principles" title="2) Open Access Principles">
          <ul className="space-y-3 pl-6 list-disc">
            <li>All published articles are accessible free of charge.</li>
            <li>No subscription, or institutional affiliation is required.</li>
            <li>Readers may view without restriction.</li>
            <li>Open Access aligns with international academic standards (Plan S, BOAI).</li>
          </ul>
        </Section>

        <Section id="licensing" title="3) Licensing & Copyright">
          <p>
            Journivo publishes under Creative Commons licenses, typically 
            <strong> CC BY 4.0</strong>, unless otherwise stated.
          </p>
          <ul className="space-y-3 pl-6 list-disc">
            <li>Authors retain copyright to their work.</li>
            <li>Authors grant the journal a non-exclusive right to publish.</li>
            <li>Readers may reuse content with proper attribution.</li>
          </ul>
        </Section>

        <Section id="author-rights" title="4) Author Rights">
          <ul className="space-y-3 pl-6 list-disc">
            <li>Authors own their content and may distribute it freely.</li>
            <li>Manuscripts may be shared on repositories, websites, or social platforms.</li>
            <li>No embargo period applies for accepted manuscripts.</li>
            <li>Revisions may be posted publicly as preprints.</li>
          </ul>
        </Section>

        <Section id="repository" title="5) Repository & Archiving">
          <p>Journivo supports long-term digital preservation and repository storage.</p>
          <ul className="space-y-3 pl-6 list-disc">
            <li>Authors may deposit preprints and postprints anywhere.</li>
            <li>Published versions are archived permanently.</li>
            <li>We support institutional, subject, and public repositories (e.g., arXiv, Zenodo).</li>
          </ul>
        </Section>

        <Section id="fees" title="6) Publication Fees">
          <p>
            Journivo may charge Article Processing Charges (APCs) depending on 
            article type and editorial requirements. Fee waivers are available for:
          </p>
          <ul className="space-y-3 pl-6 list-disc">
            <li>Students and early-stage researchers</li>
            <li>Authors from low-income nations</li>
            <li>Special issues or invited submissions</li>
          </ul>
        </Section>

        <Section id="ethics" title="7) Ethics & Transparency">
          <ul className="space-y-3 pl-6 list-disc">
            <li>Open Access does not compromise peer-review quality.</li>
            <li>Editorial decisions remain independent of publication fees.</li>
            <li>All conflicts of interest must be declared.</li>
            <li>Ethical compliance is required for all submissions.</li>
          </ul>
        </Section>

        <Section id="reuse" title="8) Reuse & Distribution">
          <p>
            Articles published under Open Access may be redistributed freely 
            with proper citation. Allowed uses depend on the article’s specific 
            Creative Commons license.
          </p>
          <ul className="space-y-3 pl-6 list-disc">
            <li>Educational reuse (courses, workshops)</li>
            <li>Research reuse (meta-analyses, citations)</li>
            <li>Commercial reuse (allowed for CC BY 4.0)</li>
          </ul>
        </Section>

        <Section id="compliance" title="9) Funders & Compliance">
          <p>
            Journivo’s Open Access Policy complies with major global funder 
            requirements, including:
          </p>
          <ul className="space-y-3 pl-6 list-disc">
            <li>NIH Public Access Policy</li>
            <li>Horizon Europe & Plan S</li>
            <li>Wellcome Trust</li>
            <li>UKRI Open Access Requirements</li>
          </ul>
        </Section>

        <Section id="contact" title="10) Contact">
          <p>
            Questions about Open Access? Contact us at{" "}
            <a href="mailto:openaccess@journivo.example" className="underline text-[#d4a64a]">
              openaccess@journivo.example
            </a>.
          </p>
        </Section>
      </div>

    </main>
  );
}
