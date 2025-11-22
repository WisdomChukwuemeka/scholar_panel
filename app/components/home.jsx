"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { highlights, sections, editorialBoard, articles } from "./image";

// Text data in an array


 // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    hover: { scale: 1.03, boxShadow: "0px 8px 20px rgba(0,0,0,0.15)" },
  };



// Animation variants
const slideVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 1 } },
  exit: { opacity: 0, x: -100, transition: { duration: 1 } },
};




export default function HomePage () {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto change highlight every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const handleScroll = () => {
    const icon = document.getElementById("customerCareIcon");
    if (icon) {
      if (window.scrollY > window.innerHeight / 2) {
        icon.classList.remove("opacity-0", "invisible");
        icon.classList.add("opacity-100", "visible");
      } else {
        icon.classList.remove("opacity-100", "visible");
        icon.classList.add("opacity-0", "invisible");
      }
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  return (
    <>
      {/* First Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <Image
          src="/logo/book.png"
          alt="Background"
          fill
          priority
          className="object-cover "
        />
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="relative text-center text-white">
          <h1 className="text-4xl font-bold text-blue-600">Publications</h1>
          <p className="mt-2 text px-3 md:px-0 max-w-2xl mx-auto">
            We make publishing your work super easy from the comfort of your home.
          </p>
        </div>
      </section>

      {/* Second Section */}
      <section className="bg-white grid grid-cols-1 md:grid-cols-2 gap-5 items-center px-6 md:px-16 py-12">
        {/* Left Images */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Image
              src="/library/bookfour.png"
              alt="Open Book"
              width={500}
              height={500}
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
          <div>
            <Image
              src="/library/booktwo.png"
              alt="Lab Experiment"
              width={250}
              height={250}
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
          <div>
            <Image
              src="/library/bookthree.png"
              alt="Molecular Research"
              width={250}
              height={250}
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
        </div>

        {/* Right Text (slideshow with animation) */}
        <div className="space-y-2 flex flex-col items-center w-fit overflow-hidden">
          <section className="relative px-1 md:px-0 py-12 min-h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full mb-10 pb-5 flex flex-col items-center justify-center space-y-4 text-center"
              >
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                {highlights[currentIndex].title}
                </h2>
                <p className="text-gray-600">
                  {highlights[currentIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Buttons */}
          <div className="absolute bottom-0 flex gap-4 pt-4">
            <Link href="/publications/create">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-2 rounded-md transition cursor-pointer">
              Submit Article
            </button>
            </Link>
        
            <Link href="/publications/list">
            <button className="border border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-2 py-2 rounded-md transition cursor-pointer">
              View All Publications
            </button>
            </Link>
          </div>
          </section>      
        </div>
      </section>

      {/* Recent Publications */}
       <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Heading */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-blue-900">
            Recent Articles
          </h2>
          <div className="flex items-center gap-6 text-sm text-blue-700">
            <button className="flex items-center gap-1 hover:underline">
              <i className="bi bi-arrow-left"></i> Previous
            </button>
            <button className="hover:underline">View All</button>
            <button className="flex items-center gap-1 hover:underline">
              Next <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="w-full h-48 relative">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col justify-between">
                <h3 className="text-lg font-semibold text-blue-900 leading-snug mb-3">
                  {article.title}
                </h3>
                <p className="text-gray-700 font-medium mb-4">
                  {article.author}
                </p>
                <button className="px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition self-start">
                  VIEW FULL ARTICLE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section>
  <div className="w-full bg-white py-8 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      {/* Section Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
        Our Publishing Commitments
      </h2>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {sections.map((section, index) => (
          <div
            key={index}
            className="bg-white/30 p-0 border-b-2 border-blue-400 rounded-lg shadow-sm 
                       flex flex-col items-start 
                       transition-transform duration-300 ease-in-out 
                       hover:scale-105 hover:shadow-lg pl-2"
          >
            <i
              className={`${section.icon} text-3xl text-gray-600 mb-4 flex-shrink-0`}
              style={{ fontSize: "2rem" }}
            ></i>
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {section.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed flex-grow">
              {section.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>


<section className="bg-gray-50 py-12 overflow-hidden">
      
          <div className="flex justify-center mb-8">
            <Link href={"/authorspage"}>
            <button className="px-3 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer">
              View Full Editorial Board
            </button>
            </Link>
          </div>
      

      <div className="relative w-full overflow-hidden">
        {/* Sliding container */}
        <div className="marquee space-x-6">
          {/* Duplicate array for smooth infinite loop */}
          {[...editorialBoard, ...editorialBoard].map((member, idx) => (
            <div
              key={idx}
              className="min-w-[250px] bg-white rounded-xl shadow-md p-4 flex flex-col items-center"
            >
              <img
                src={member.image}
                alt={member.name}
                loading="eager"            // Forces browser to load these immediately
                decoding="async"           // Decodes images asynchronously (non-blocking
                className="w-28 h-28 rounded-full object-cover mb-4"
              />
              <h3 className="text-red-600 font-semibold">{member.name}</h3>
              <p className="text-blue-900 font-bold">{member.title}</p>
              <p className="text-gray-600 text-sm text-center mt-2">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Floating Customer Care Icon */}
<Link
  href="/contact" 
  className={`fixed bottom-10 right-8 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-700 ${
    typeof window !== "undefined" && window.scrollY > window.innerHeight / 2
      ? "opacity-100 visible"
      : "opacity-0 invisible"
  }`}
  id="customerCareIcon"
>
  <i className="bi bi-headset text-2xl"></i>
</Link>


    </>
  );
};
