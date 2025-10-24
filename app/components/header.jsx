// frontend/components/Header.jsx
"use client";

import { SecureStorage } from "@/utils/secureStorage";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationAPI } from "../services/api";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggin, setIsLoggin] = useState(false);
  const [role, setRole] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPublicationsOpen, setIsPublicationsOpen] = useState(false);
  const [isConferencesOpen, setIsConferencesOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const router = useRouter();
 
  useEffect(() => {
    const checkAuthAndRole = () => {
      const token = SecureStorage.get("access_token");
      const storedRole = SecureStorage.get("role");
      setIsLoggin(!!token);
      setRole(storedRole ? storedRole.trim().toLowerCase() : "");
    };

    checkAuthAndRole();
    window.addEventListener("authChange", checkAuthAndRole);
    window.addEventListener("storage", checkAuthAndRole);

    return () => {
      window.removeEventListener("authChange", checkAuthAndRole);
      window.removeEventListener("storage", checkAuthAndRole);
    };
  }, []);

  useEffect(() => {
  if (isLoggin && !isMarkingRead) {
    const fetchNotifications = async () => {
      try {
        const unreadResponse = await NotificationAPI.unread();
        setUnreadCount(unreadResponse.data.unread_count || 0);

        const listResponse = await NotificationAPI.list();

        // ✅ Only keep unread notifications
        const unreadOnly = (listResponse.data.results || []).filter(
          (n) => !n.is_read
        );

        setNotifications(unreadOnly);
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          SecureStorage.remove("access_token");
          SecureStorage.remove("refresh_token");
          SecureStorage.remove("is_superuser");
          SecureStorage.remove("role");
          setIsLoggin(false);
          setRole("");
          setNotifications([]);
          setUnreadCount(0);
          router.push("/login");
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }
}, [isLoggin, isMarkingRead, router]);


  const handleNotificationClick = async (notification) => {
  try {
    setIsMarkingRead(true);
    await NotificationAPI.markRead(notification.id);

    // ✅ Remove from current list immediately
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    setUnreadCount((prev) => Math.max(prev - 1, 0));

    // Resume polling later
    setTimeout(() => setIsMarkingRead(false), 4000);

    router.push(
      notification.related_publication
        ? `/publications/${notification.related_publication}`
        : "/dashboard"
    );
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    setIsMarkingRead(false);
  }
};



  const handleLogout = () => {
    SecureStorage.remove("access_token");
    SecureStorage.remove("refresh_token");
    SecureStorage.remove("is_superuser");
    SecureStorage.remove("role");
    setIsLoggin(false);
    setRole("");
    setNotifications([]);
    setUnreadCount(0);
    router.push("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsPublicationsOpen(false);
    setIsConferencesOpen(false);
    setIsGuidelinesOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const togglePublications = () => {
    setIsPublicationsOpen(!isPublicationsOpen);
    setIsConferencesOpen(false);
    setIsGuidelinesOpen(false);
  };

  const toggleConferences = () => {
    setIsConferencesOpen(!isConferencesOpen);
    setIsPublicationsOpen(false);
    setIsGuidelinesOpen(false);
  };

  const toggleGuidelines = () => {
    setIsGuidelinesOpen(!isGuidelinesOpen);
    setIsPublicationsOpen(false);
    setIsConferencesOpen(false);
  };

  return (
    <section>
      <header className="relative bg-white shadow-md">
        <nav className="container mx-auto flex items-center justify-between px-8 py-2">
          <Link href="/">
            <div>
              <Image
                src="/logo/logo.png"
                alt="Logo"
                width={150}
                height={100}
                priority={true}
                className="max-w-4xl"
              />
            </div>
          </Link>
          <ul className="hidden xl:flex space-x-6 text-one">
            <Link href="/"><li className="li-hover">Home</li></Link>
            <Link href="/components/about"><li className="li-hover">About</li></Link>
            <div className="relative">
              <button className="li-hover flex items-center" onClick={togglePublications}>
                Publications <i className={`bi bi-chevron-${isPublicationsOpen ? "up" : "down"} text-sm ml-1`}></i>
              </button>
              <AnimatePresence>
                {isPublicationsOpen && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul className="py-2">
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Journals</li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Books</li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Articles</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button className="li-hover flex items-center" onClick={toggleConferences}>
                Conferences <i className={`bi bi-chevron-${isConferencesOpen ? "up" : "down"} text-sm ml-1`}></i>
              </button>
              <AnimatePresence>
                {isConferencesOpen && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul className="py-2">
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Upcoming Conferences</li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Past Conferences</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/components/contact"><li className="li-hover">Contact</li></Link>
            <div className="relative">
              <button className="li-hover flex items-center" onClick={toggleGuidelines}>
                Guidelines <i className={`bi bi-chevron-${isGuidelinesOpen ? "up" : "down"} text-sm ml-1`}></i>
              </button>
              <AnimatePresence>
                {isGuidelinesOpen && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul className="py-2">
                      <Link href="/guidelines/author"><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Authors</li></Link>
                      <Link href="/guidelines/reviewers"><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Reviewers</li></Link>
                      <Link href="/guidelines/editors"><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Editors</li></Link>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/components/services"><li className="li-hover">Services</li></Link>
            <Link href="/components/resources"><li className="li-hover">Resources</li></Link>
          </ul>
          <div className="flex space-x-4 text-one">
            <div className="relative flex items-center cursor-pointer" onClick={toggleNotifications}>
              <i className="bi bi-bell text-2xl"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">{unreadCount}</span>
              )}
            </div>
            {isLoggin ? (
              <button className="flex bg-blue-600 text-white btn hover:bg-blue-800 duration-500" onClick={handleLogout}>Logout</button>
            ) : (
              <Link href="/login"><button className="flex bg-blue-600 text-white btn hover:bg-blue-800 duration-500">Login</button></Link>
            )}
            
            {role === "editor" ? (
              <Link href="/dashboard"><button className="hidden xl:flex bg-blue-600 text-white btn hover:bg-blue-800 duration-500 px-4 py-2 rounded-md">Dashboard</button></Link>
            ) : (
              <Link href="/publications/create"><button className="hidden xl:flex bg-orange-600 text-white btn hover:bg-orange-800 duration-500">Submit an Article</button></Link>
            )}
            <div className="cursor-pointer text-black" onClick={toggleMenu}>
              {isMenuOpen ? <i className="bi bi-x-lg text-2xl xl:hidden"></i> : <i className="bi bi-list text-2xl xl:hidden"></i>}
            </div>
          </div>
        </nav>
        <AnimatePresence>
          {isNotificationOpen && (
            <motion.div
              className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                {notifications.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className="text-sm text-gray-700">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString("en-US", {
                            timeZone: "Africa/Lagos",
                            hour12: true,
                            hour: "numeric",
                            minute: "numeric",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No new notifications</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="xl:hidden absolute right-0 w-full bg-white shadow-lg z-50 overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <ul className="grid grid-cols-2 gap-2 p-8 text-gray-800 text-center font-medium">
              <Link href="/">
                <li className="flex items-center justify-center gap-2 hover:bg-blue-100 py-2 rounded-md cursor-pointer transition duration-300">
                  Home
                </li>
              </Link>
              <Link href="/components/about">
                <li className="flex items-center justify-center gap-2 hover:bg-blue-100 py-2 rounded-md cursor-pointer transition duration-300">
                  About
                </li>
              </Link>
              <div className="relative">
                <button
                  className="flex items-center justify-center gap-2 hover:bg-blue-100 py-2 rounded-md cursor-pointer transition duration-300 w-full"
                  onClick={togglePublications}
                >
                  Publications{" "}
                  <i className={`bi bi-chevron-${isPublicationsOpen ? "up" : "down"} text-sm`}></i>
                </button>
                <AnimatePresence>
                  {isPublicationsOpen && (
                    <motion.div
                      className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ul className="py-2">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Journals</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Books</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Articles</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative">
                <button
                  className="flex items-center justify-center gap-2 hover:bg-blue-100 py-2 rounded-md cursor-pointer transition duration-300 w-full"
                  onClick={toggleConferences}
                >
                  Conferences{" "}
                  <i className={`bi bi-chevron-${isConferencesOpen ? "up" : "down"} text-sm`}></i>
                </button>
                <AnimatePresence>
                  {isConferencesOpen && (
                    <motion.div
                      className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ul className="py-2">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Upcoming Conferences</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Past Conferences</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link href="/components/contact">
                <li className="flex items-center justify-center gap-2 hover:bg-blue-100 py-2 rounded-md cursor-pointer transition duration-300">
                  Contact
                </li>
              </Link>
              <div className="relative">
                <button
                  className="flex items-center justify-center gap-2 hover:bg-blue-100 py-2 rounded-md cursor-pointer transition duration-300 w-full"
                  onClick={toggleGuidelines}
                >
                  Guidelines{" "}
                  <i className={`bi bi-chevron-${isGuidelinesOpen ? "up" : "down"} text-sm`}></i>
                </button>
                <AnimatePresence>
                  {isGuidelinesOpen && (
                    <motion.div
                      className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ul className="py-2">
                        <Link href="/guidelines/author"><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Authors</li></Link>
                        <Link href="/guidelines/reviewers"><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Reviewers</li></Link>
                        <Link href="/guidelines/editors"><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Editors</li></Link>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link href="/components/services">
                <li className="flex items-center justify-center gap-2 hover:bg-blue-100 py-2 rounded-md cursor-pointer transition duration-300">
                  Services
                </li>
              </Link>
              <Link href="/components/resources">
                <li className="flex items-center justify-center gap-2 hover:bg-blue-100 py-2 rounded-md cursor-pointer transition duration-300">
                  Resources
                </li>
              </Link>
              <li className="col-span-2 flex justify-center">
                {role === "editor" ? (
                  <div>
                    <Link href="/dashboard">
                      <button className="xl:hidden bg-blue-600 text-white btn hover:bg-blue-800 duration-500 px-4 py-2 rounded-md">Dashboard</button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 justify-center items-center">
                    <Link href="/publications/create">
                      <button
                        className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-orange-700 hover:scale-105 transition duration-500 shadow-md"
                        onClick={toggleMenu}
                      >
                        Submit an Article
                      </button>
                    </Link>
                    <div>
                      <Link href="/publications/paymenthistory/" className="xl:hidden bg-blue-600 text-white btn hover:bg-blue-800 duration-500 px-4 py-2 rounded-md">
                        Payment History
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};