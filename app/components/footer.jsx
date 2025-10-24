"use client";

import Image from "next/image";
export const Footer = () => {
  return (
    <>
      <footer className="relative bg-blue-900 text-gray-300 pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Logo + Mission */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-lg font-bold text-white">Journivo</h2>
            </div>
            <p className="text-xs leading-relaxed">
              Breaking barriers in academic publishing. Journivo is dedicated to
              making research accessible, afforadable, transparent, and globally impactful.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-md font-semibold text-white mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm grid grid-cols-3 md:grid-cols-2">
              <li><a href="#" className="hover:text-cyan-400 transition">About Us</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Journals</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Conferences</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Guidelines</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Services</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Contact</a></li>
            </ul>
          </div>

          {/* Column 3: Contact + Socials */}
          <div>
            <h3 className="text-md font-semibold text-white mb-2">Get in Touch</h3>
            <p className="text-xs">📍 Port Harcourt, Rivers State, Nigeria</p>
            <p className="text-xs">✉️ contact@journivo.org</p>
            <p className="text-xs mb-2">📞 +234 800 123 4567</p>

            <div className="flex space-x-3 mt-1">
              <a href="#" className="hover:text-cyan-400 transition"><i className="bi bi-facebook text-lg"></i></a>
              <a href="#" className="hover:text-cyan-400 transition"><i className="bi bi-twitter text-lg"></i></a>
              <a href="#" className="hover:text-cyan-400 transition"><i className="bi bi-linkedin text-lg"></i></a>
              <a href="#" className="hover:text-cyan-400 transition"><i className="bi bi-instagram text-lg"></i></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 border-t border-white/20 py-3 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Journivo. All Rights Reserved.
        </div>
      </footer>
    </>
  );
};
