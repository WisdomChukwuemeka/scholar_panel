"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskAPI } from '@/app/services/api';
import { Book, UserRound, Clock, User, Calendar, CheckCircle2, Circle, PlayCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 10;

export default function EditorTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [role, setRole] = useState("");
  const [isLoggin, setIsLoggin] = useState(true);
  const [notification, setNotification] = useState(null);



  useEffect(() => {
  if (typeof window !== "undefined") {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole?.trim().toLowerCase() || "");
    setIsLoggin(!!storedRole);
  }
}, []);

  const fetchTasks = async (page = 1) => {
    if (!isLoggin || role !== "editor") return;
    try {
      setLoading(true);
      const res = await TaskAPI.listMyTasks({ page });
      setTasks(res.data.results || res.data || []);
      setNextPage(res.data.next);
      setPreviousPage(res.data.previous);
      setTotalPages(res.data.count ? Math.ceil(res.data.count / PAGE_SIZE) : 1);
      setCurrentPage(page);
    } catch (err) {
      notify('Failed to load your tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateAuthState = () => {
      const storedRole = localStorage.getItem("role");
      setIsLoggin(!!storedRole);
      setRole(storedRole?.trim().toLowerCase() || "");
    };

    updateAuthState();
    window.addEventListener("authChange", updateAuthState);

    return () => {
      window.removeEventListener("authChange", updateAuthState);
    };
  }, []);

  useEffect(() => {
    if (!isLoggin) {
      router.push("/login");
      return;
    }

    if (role !== "editor") {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isLoggin, role, router]);

  useEffect(() => {
    if (isLoggin && role === "editor") {
      fetchTasks();
    }
  }, [isLoggin, role]);

  const handleInProgress = async (id) => {
    try {
      await TaskAPI.markInProgress(id);
      await fetchTasks(currentPage);
    } catch (err) {
      notify('Failed to start task', 'error');
    }
  };

  const handleReply = async (id) => {
    const message = replyMessage.trim();
    if (!message) {
      return notify('Please write a reply message', 'error');
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      console.log('Submitting reply for task:', id);
      await TaskAPI.reply(id, { reply_message: message });
      notify('Task completed successfully!');
      setReplyMessage('');
      setReplyingTo(null);
      await fetchTasks(currentPage);
    } catch (err) {
      console.error('Reply failed:', err.response || err);
      const errorMsg =
        err.response?.data?.reply_message?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to submit reply. Please try again.';
      notify(errorMsg, 'error');
      console.log('Error details:', err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'No due date';
    return new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const statusConfig = {
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending Review', icon: Circle },
    in_progress: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'In Progress', icon: PlayCircle },
    completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed', icon: CheckCircle2 },
    rejected: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected', icon: Circle },
  };

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // if (!isLoggin) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200">
  //       <motion.div
  //         initial={{ opacity: 0, scale: 0.8 }}
  //         animate={{ opacity: 1, scale: 1 }}
  //         transition={{ duration: 0.6 }}
  //         className="flex flex-col items-center"
  //       >
  //         <p className="text-slate-600 mt-3 text-lg">
  //           Redirecting to login...
  //         </p>
  //       </motion.div>
  //     </div>
  //   );
  // }

  if (isLoggin && role === "publisher") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mb-6 bg-white p-8 rounded-full shadow-2xl"
            >
              <UserRound className="w-32 h-32 text-indigo-600" />
            </motion.div>

            <div className="flex gap-6 mt-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ y: -10 }}
                  animate={{ y: 10 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.2 + i * 0.2,
                  }}
                >
                  <Book className="w-10 h-10 text-indigo-600 opacity-80" />
                </motion.div>
              ))}
            </div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-3xl font-bold mt-8 text-slate-800"
            >
              404 — Access Denied
            </motion.h2>

            <p className="text-slate-600 mt-3 text-lg">
              Redirecting you to the home page...
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
            className={`fixed top-8 right-8 z-50 px-8 py-4 rounded-2xl shadow-2xl text-white font-medium flex items-center gap-3
              ${notification.type === "success" ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-rose-500 to-rose-600"}`}
          >
            {notification.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-indigo-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Editorial Tasks
            </h1>
          </div>
          <p className="text-lg text-slate-600">Manage your publication assignments and deadlines</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-32">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"
            />
            <p className="mt-6 text-xl text-slate-600 font-medium">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-white rounded-3xl shadow-xl border border-slate-200"
          >
            <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 mb-2">All Caught Up!</h2>
            <p className="text-xl text-slate-500">No pending tasks at the moment</p>
          </motion.div>
        ) : (
          <>
            <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task, idx) => {
                const cfg = statusConfig[task.status] || {};
                const StatusIcon = cfg.icon || Circle;
                const isActive = task.status === 'pending' || task.status === 'in_progress';
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden
                      ${task.is_overdue 
                        ? 'border-rose-300 bg-gradient-to-br from-rose-50 to-red-50' 
                        : 'border-slate-200 bg-white'
                      }`}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-white pr-4">{task.title}</h2>
                        <span className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 backdrop-blur-sm bg-white/90 flex items-center gap-2 ${cfg.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {cfg.label || task.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Description */}
                      <p className="text-lg text-slate-700 mb-8 leading-relaxed border-l-4 border-indigo-200 pl-6 py-2 bg-indigo-50/30 rounded-r-lg">
                        {task.description}
                      </p>

                      {/* Meta Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-xl border border-slate-200">
                          <User className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Assigned By</p>
                            <p className="text-slate-800 font-semibold">
                              {task.assigned_by?.full_name || task.assigned_by?.email || 'Admin'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-xl border border-slate-200">
                          <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Due Date</p>
                            <p className="text-slate-800 font-semibold">{formatDate(task.due_date)}</p>
                          </div>
                        </div>
                      </div>

                      {task.is_overdue && (
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="bg-rose-100 border-2 border-rose-300 rounded-2xl px-6 py-4 mb-8 flex items-center gap-3"
                        >
                          <Clock className="w-6 h-6 text-rose-600" />
                          <span className="text-rose-700 font-bold text-lg">This task is overdue!</span>
                        </motion.div>
                      )}

                      {/* Timeline */}
                      <div className="bg-slate-50 rounded-2xl p-8 mb-8 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-600" />
                          Task Timeline
                        </h3>
                        <div className="relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-400 before:to-indigo-200">
                          {[
                            { date: task.created_at ? formatDate(task.created_at) : 'N/A', desc: 'Task created and assigned', completed: true },
                            { date: task.status !== 'pending' ? formatDate(task.updated_at || new Date()) : '', desc: 'Work started', completed: task.status !== 'pending' },
                            { date: task.status === 'completed' ? formatDate(task.replied_at) : '', desc: 'Submitted for review', completed: task.status === 'completed' },
                            { date: task.status === 'completed' ? formatDate(task.replied_at) : '', desc: 'Task approved', completed: task.status === 'completed' },
                          ].map((event, index) => (
                            <div key={index} className="mb-8 last:mb-0 relative">
                              <div className={`absolute left-[-32px] flex items-center justify-center w-6 h-6 rounded-full border-2 
                                ${event.completed 
                                  ? 'bg-indigo-600 border-indigo-600' 
                                  : 'bg-white border-slate-300'
                                }`}>
                                {event.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                              </div>
                              <div className="ml-2">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">{event.date}</p>
                                <p className={`text-sm font-medium ${event.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                                  {event.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Completion Message */}
                      {task.status === 'completed' && task.reply_message && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 mb-6"
                        >
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                            <div>
                              <p className="font-bold text-emerald-800 mb-2 text-lg">
                                Completed on {new Date(task.replied_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-emerald-700 leading-relaxed">"{task.reply_message}"</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        {task.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleInProgress(task.id)}
                            disabled={submitting}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                          >
                            <PlayCircle className="w-5 h-5" />
                            Start Working
                          </motion.button>
                        )}
                        {isActive && (
                          <>
                            {replyingTo === task.id ? (
                              <div className="w-full space-y-4 bg-gradient-to-br from-slate-50 to-indigo-50 p-8 rounded-2xl border-2 border-indigo-200">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Your Completion Notes</label>
                                <textarea
                                  rows={5}
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  placeholder="Describe what you've completed and any important details..."
                                  className="w-full p-5 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 resize-none text-slate-700 placeholder-slate-400 bg-white"
                                  disabled={submitting}
                                />
                                <div className="flex gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleReply(task.id)}
                                    disabled={submitting}
                                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {submitting ? 'Submitting...' : 'Submit & Complete'}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyMessage('');
                                    }}
                                    disabled={submitting}
                                    className="bg-slate-300 text-slate-700 px-6 py-4 rounded-xl hover:bg-slate-400 font-semibold transition-all"
                                  >
                                    Cancel
                                  </motion.button>
                                </div>
                              </div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setReplyingTo(task.id)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                                Complete Task
                              </motion.button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center items-center gap-6 mt-12 bg-white px-8 py-6 rounded-2xl shadow-lg border border-slate-200"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchTasks(currentPage - 1)}
                disabled={!previousPage}
                className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-xl hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold shadow-md transition-all"
              >
                ← Previous
              </motion.button>
              <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
                <span className="text-slate-600 font-medium">Page</span>
                <span className="text-indigo-600 font-bold text-lg">{currentPage}</span>
                <span className="text-slate-600 font-medium">of</span>
                <span className="text-slate-700 font-bold text-lg">{totalPages}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchTasks(currentPage + 1)}
                disabled={!nextPage}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold shadow-md transition-all"
              >
                Next →
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}