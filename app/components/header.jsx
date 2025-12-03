"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationAPI } from "../services/api";
import { ProfileAPI } from "../services/api";
import { AuthAPI } from "../services/api";
// const notificationRoutes = {
//   publication: (n) => `/publications/${n.related_id}`,
//   task: (n) => `/tasks/${n.related_id}`,
//   message: (n) => `/messages/${n.related_id}`,
//   comment: (n) => `/comments/${n.related_id}`,
//   // Add more here without breaking the component
// };



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
  const [profileImage, setProfileImage] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const router = useRouter();

  // ✅ Check user authentication and role
 useEffect(() => {
    const updateAuthState = () => {
      const storedRole = localStorage.getItem("role");
      setIsLoggin(!!storedRole);           // ← Now correct
      setRole(storedRole?.trim().toLowerCase() || "");
    };

    updateAuthState();
    window.addEventListener("authChange", updateAuthState);

    return () => {
      window.removeEventListener("authChange", updateAuthState);
    };
  }, []);

  useEffect(() => {
  setHydrated(true);
}, []);

  // ✅ Fetch notifications without flicker
  // Header.js — Replace the entire notification useEffect with this

useEffect(() => {
  if (!isLoggin || isMarkingRead) return;

  const fetchNotifications = async () => {
    try {
      const res = await NotificationAPI.listUnread();
      const unread = (res.data.results || res.data || []).filter(
        (n) => !n.is_read
      );

      const isTaskNotification = (n) => {
    return (
      n.type === "task" ||
      n.related_task ||
      n.message.toLowerCase().includes("task")
    );
  };

      let filtered = unread;

      if (role !== "editor") {
        filtered = unread.filter((n) => !isTaskNotification(n));
      }

      setNotifications(filtered);
      setUnreadCount(filtered.length);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("role");
        window.dispatchEvent(new Event("authChange"));
        setIsLoggin(false);
        setRole("");
        router.push("/login");
      }
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 10000);
  return () => clearInterval(interval);
}, [
  isLoggin,
  isMarkingRead,
  role,
  router, // <-- this MUST always be present
]);

  
  useEffect(() => {
  const loadProfile = async () => {
    if (!isLoggin) return;
    const res = await ProfileAPI.list();
    const profiles = res.data.results;
    setProfileImage(profiles?.[0]?.profile_image || null);
  };

  loadProfile();

  window.addEventListener("profileUpdated", loadProfile);
  return () => window.removeEventListener("profileUpdated", loadProfile);
}, [isLoggin]);



  // ✅ Handle click on notification item
  const handleNotificationClick = async (notification) => {
    try {
      setIsMarkingRead(true);
      await NotificationAPI.markRead(notification.id);

      // Remove from current list immediately
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setUnreadCount((prev) => Math.max(prev - 1, 0));

      // Resume polling later
      // setTimeout(() => setIsMarkingRead(false), 4000);

      router.push(
      notification.related_publication
        ? `/publications/${notification.related_publication}`
        : notification.related_task
        ? `/tasks/${notification.related_task}`
        : "/tasks"   // Default fallback for task notifications without ID
    );


    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setIsMarkingRead(false);
    }
  };

  // ✅ Logout
 const handleLogout = async () => {
  await AuthAPI.logout();

  // ⚠️ Cancel pending axios requests
  // api.defaults.headers.common['Authorization'] = null;
  
  localStorage.removeItem('role');
  window.dispatchEvent(new Event('authChange'));

  router.push('/login');
};


  // ✅ Menu toggles
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsPublicationsOpen(false);
    setIsConferencesOpen(false);
    setIsGuidelinesOpen(false);
  };

  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);
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

  if (!hydrated) return null;

  return (
    <section className="mb-1 shadow-md">
      <header className="relative bg-white shadow-md">
        <nav className="container mx-auto flex items-center justify-between px-2 py-2">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo/logo.png"
              alt="Logo"
              width={150}
              height={100}
              priority
              className="max-w-4xl"
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden xl:flex space-x-6 text-one">
            <Link href="/"><li className="li-hover">Home</li></Link>
            <Link href="/about"><li className="li-hover">About</li></Link>
            <Link href="/publications/list"><li className="li-hover">Publications</li></Link>

            {/* Conferences Dropdown */}
            <div className="relative">
              <button
                className="li-hover flex items-center"
                onClick={toggleConferences}
              >
                Conferences{" "}
                <i
                  className={`bi bi-chevron-${isConferencesOpen ? "up" : "down"} text-sm ml-1`}
                ></i>
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
                      <Link href="/conference/upcoming">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Upcoming Conferences
                      </li>
                      </Link>
                      
                       <Link href="/conference/past">
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Past Conferences
                      </li>
                      </Link>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/contact"><li className="li-hover">Contact</li></Link>

            {/* Guidelines Dropdown */}
            <div className="relative">
              <button
                className="li-hover flex items-center"
                onClick={toggleGuidelines}
              >
                Guidelines{" "}
                <i
                  className={`bi bi-chevron-${isGuidelinesOpen ? "up" : "down"} text-sm ml-1`}
                ></i>
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
                      <Link href="/guidelines/author">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Authors</li>
                      </Link>
                      <Link href="/guidelines/reviewers">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Reviewers</li>
                      </Link>
                      <Link href="/guidelines/editors">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">For Editors</li>
                      </Link>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/our-services"><li className="li-hover">Services</li></Link>
            <Link href="/resources"><li className="li-hover">Resources</li></Link>
          </ul>

          {/* Right Section */}
          <div className="flex space-x-4 text-one items-center">

{isLoggin && (
  <div className="hidden md:flex">
    <Link href="/profile">
      <div className="relative inline-block">
      {profileImage ? (
        <img
          src={profileImage}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <i className="bi bi-person-circle text-2xl"></i>
      )}
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
    </Link>
  </div>
)}

        
            {/* 🔔 Notifications */}
            <div
              className="relative flex items-center cursor-pointer"
              onClick={toggleNotifications}
            >
              <i className="bi bi-bell text-2xl"></i>

              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Buttons */}
            {isLoggin ? (
              <button
                className="flex bg-blue-600 text-white btn hover:bg-blue-800 duration-500 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link href="/login">
                <button className="flex bg-blue-600 text-white btn hover:bg-blue-800 duration-500 cursor-pointer">
                  Login
                </button>
              </Link>
            )}

            {/* Role-specific Buttons */}
            {role === "editor" ? (
              <Link href="/dashboard">
                <button className="hidden xl:flex bg-blue-600 text-white btn hover:bg-blue-800 duration-500 px-4 py-2 rounded-md cursor-pointer">
                  Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/publications/create">
                <button className="hidden xl:flex bg-orange-600 text-white btn hover:bg-orange-800 duration-500 cursor-pointer">
                  Submit Article
                </button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <div className="cursor-pointer text-black" onClick={toggleMenu}>
              {isMenuOpen ? (
                <i className="bi bi-x-lg text-2xl md:text-3xl xl:hidden"></i>
              ) : (
                <i className="bi bi-list text-2xl md:text-3xl xl:hidden"></i>
              )}
            </div>
          </div>
        </nav>

        {/* 🔔 Notification Dropdown */}
        <AnimatePresence>
          {isNotificationOpen && (
            <motion.div
              className="absolute right-0 mt-0 w-80 bg-white border border-gray-200 shadow-lg z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 z-20">
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
                  <p className="text-sm text-gray-500 mt-2">No new notifications</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 📱 Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
<motion.div
  className="text-md md:text-[1.5rem] xl:hidden fixed top-0 left-0 w-full h-full p-5 bg-white z-50 overflow-y-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <ul className=" text-one flex flex-col gap-5 justify-center items-center max-w-3xl
            " >
            <Link href="/" onClick={() => setIsMenuOpen(false)}><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md font-medium text-gray-800">Home</li></Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)}><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md font-medium text-gray-800">About</li></Link>
            <Link href="/publications/list" onClick={() => setIsMenuOpen(false)}><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md font-medium text-gray-800">Publications</li></Link>

            {/* Conferences Dropdown */}
            <div className="relative col-span-1">
              <button
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center rounded-md font-medium text-gray-800 w-full"
                onClick={toggleConferences}
              >
                Conferences{" "}
                <i
                  className={`bi bi-chevron-${isConferencesOpen ? "up" : "down"} text-sm ml-1`}
                ></i>
              </button>
              <AnimatePresence>
                {isConferencesOpen && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 shadow-lg z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul className="py-2">
                      <Link href="/conference/upcoming" onClick={() => setIsMenuOpen(false)}>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Upcoming Conferences
                      </li>
                      </Link>

                      
                      <Link href="/conference/past" onClick={() => setIsMenuOpen(false)}>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Past Conferences
                      </li>
                      </Link>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/contact" onClick={() => setIsMenuOpen(false)}><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md font-medium text-gray-800">Contact</li></Link>

            {/* Guidelines Dropdown */}
            <div className="relative col-span-1">
              <button
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center rounded-md font-medium text-gray-800 w-full"
                onClick={toggleGuidelines}
              >
                Guidelines{" "}
                <i
                  className={`bi bi-chevron-${isGuidelinesOpen ? "up" : "down"} text-sm ml-1`}
                ></i>
              </button>
              <AnimatePresence>
                {isGuidelinesOpen && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 shadow-lg z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul className="py-2">
                      <Link href="/guidelines/author" onClick={() => setIsMenuOpen(false)}>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Authors</li>
                      </Link>
                      <Link href="/guidelines/reviewers" onClick={() => setIsMenuOpen(false)}>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Reviewers</li>
                      </Link>
                      <Link href="/guidelines/editors" onClick={() => setIsMenuOpen(false)}>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Editors</li>
                      </Link>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/our-services" onClick={() => setIsMenuOpen(false)}><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md font-medium text-gray-800">Services</li></Link>
            <Link href={"/resources"} onClick={() => setIsMenuOpen(false)}><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md font-medium text-gray-800">Resources</li></Link>
            {isLoggin && (
                <Link href="/payment/history" onClick={() => setIsMenuOpen(false)}><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md font-medium text-gray-800">Payment History</li></Link>
            )}
            {isLoggin && role === "editor" && (
                <Link href="/tasks" onClick={() => setIsMenuOpen(false)}><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md font-medium text-gray-800">Tasks</li></Link>
            )}

            {/* Role-specific Buttons */}
            <div className="col-span-3 flex justify-center">
            {role === "editor" ? (
              <Link href="/dashboard" className="flex justify-center" onClick={() => setIsMenuOpen(false)}>
                <button className="bg-blue-600 text-white btn hover:bg-blue-800 duration-500 px-4 py-2 rounded-md cursor-pointer">
                  Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/publications/create" className="flex justify-center" onClick={() => setIsMenuOpen(false)}>
                <button className="bg-orange-600 text-white btn hover:bg-orange-800 duration-500 px-4 py-2 rounded-md cursor-pointer">
                  Submit Article
                </button>
              </Link>
            )}
            </div>
          </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};