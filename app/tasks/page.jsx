"use client";
import { useState, useEffect } from 'react';
import { TaskAPI } from '../services/api';
import { Book, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 10;

export default function EditorTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false); // Prevent double click
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [role, setRole] = useState("")
  const [show404, setShow404] = useState(false);
  const [isLoggin, setIsLoggin] = useState(false);
  const [notification, setNotification] = useState(null);


  const fetchTasks = async (page = 1) => {
    try {
      setLoading(true);
      const res = await TaskAPI.listMyTasks({ page });
      setTasks(res.data.results || res.data || []);
      setNextPage(res.data.next);
      setPreviousPage(res.data.previous);
      setTotalPages(res.data.count ? Math.ceil(res.data.count / PAGE_SIZE) : 1);
      setCurrentPage(page);
    } catch (err) {
      notify('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };

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
    if (!isLoggin || role !== "editor") {
      setShow404(true);
  
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 5000);
  
      return () => clearTimeout(timer);
    }
  }, [isLoggin, role]);
  


  useEffect(() => {
    fetchTasks();
  }, []);

  const handleInProgress = async (id) => {
    try {
      await TaskAPI.markInProgress(id);
      await fetchTasks(currentPage); // Always refresh after success
    } catch (err) {
      notify('Failed to start task');

    }
  };

  const handleReply = async (id) => {
    const message = replyMessage.trim();
    if (!message) {
      return notify('Please write a reply message');

    }
    if (submitting) return; // Prevent double submit
    setSubmitting(true);
    try {
      console.log('Submitting reply for task:', id);
      await TaskAPI.reply(id, { reply_message: message });
      // Success! Now refresh the list
      notify('Task completed successfully!');
      setReplyMessage('');
      setReplyingTo(null);
      // Critical: Refetch fresh data from server
      await fetchTasks(currentPage);
    } catch (err) {
      console.error('Reply failed:', err.response || err);
      const errorMsg =
        err.response?.data?.reply_message?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to submit reply. Please try again.';
      notify(errorMsg);
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
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  };

  const notify = (message, type = "success") => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 3000);
};


  return (
    <>
    {isLoggin && role === "editor" ? (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        {notification && (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-lg text-white 
        ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {notification.message}
    </motion.div>
  </AnimatePresence>
)}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">My Tasks</h1>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">No tasks yet</div>
            <p className="text-xl text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <>
            {/* Card view for all screens */}
            <div className="grid grid-cols-1 space-y-6  xl:space-y-0 xl:gap-6">
              {tasks.map(task => {
                const cfg = statusConfig[task.status] || {};
                const isActive = task.status === 'pending' || task.status === 'in_progress';
                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl shadow-lg p-8 border-2 transition-all ${
                      task.is_overdue
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white hover:shadow-xl'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                      <span className={`px-4 py-2 rounded-full font-bold text-sm ${cfg.color}`}>
                        {cfg.label || task.status}
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">{task.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                      <div>
                        <strong>Assigned by:</strong>{' '}
                        {task.assigned_by?.full_name || task.assigned_by?.email || 'Admin'}
                      </div>
                      <div>
                        <strong>Due:</strong> {formatDate(task.due_date)}
                      </div>
                      {task.is_overdue && (
                        <div className="md:col-span-2">
                          <span className="text-red-600 font-bold text-lg">OVERDUE!</span>
                        </div>
                      )}
                    </div>
                    {/* Task History Timeline */}
                    <div className="relative pl-6 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                      {[
                        { date: task.created_at ? formatDate(task.created_at) : 'N/A', desc: 'Task created and assigned', completed: true },
                        { date: task.status !== 'pending' ? formatDate(task.updated_at || new Date()) : '', desc: 'Project moved to "In Progress"', completed: task.status !== 'pending' },
                        { date: task.status === 'completed' ? formatDate(task.replied_at) : '', desc: 'Under review', completed: task.status === 'completed' },
                        { date: task.status === 'completed' ? formatDate(task.replied_at) : '', desc: 'Task completed', completed: task.status === 'completed' },
                      ].map((event, index) => (
                        <div key={index} className="mb-6 relative">
                          <div className={`absolute left-[-27px] flex items-center justify-center w-6 h-6 rounded-full ${event.completed ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                          <div className="ml-6">
                            <p className="text-xs text-gray-500">{event.date}</p>
                            <p className="text-sm font-medium text-gray-900">{event.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Show reply if completed */}
                    {task.status === 'completed' && task.reply_message && (
                      <div className="bg-green-50 p-5 rounded-lg border border-green-300">
                        <p className="font-bold text-green-800 mb-1">
                          Completed on {new Date(task.replied_at).toLocaleDateString()}
                        </p>
                        <p className="text-green-700 italic">"{task.reply_message}"</p>
                      </div>
                    )}
                    {/* Action Buttons */}
                    <div className="mt-6 space-y-4 w-fit h-fit p-2 grid grid-cols-1 xl:grid-cols-2 justify-between items-center gap-4">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleInProgress(task.id)}
                          disabled={submitting}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Start Working
                        </button>
                      )}
                      {isActive && (
                        <>
                          {replyingTo === task.id ? (
                            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border">
                              <textarea
                                rows={5}
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Write your reply here... (e.g., I have proofread the article and made corrections.)"
                                className="w-full p-4 border-2 border-indigo-300 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 resize-none"
                                disabled={submitting}
                              />
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleReply(task.id)}
                                  disabled={submitting}
                                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                                >
                                  {submitting ? 'Submitting...' : 'Submit & Complete Task'}
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyMessage('');
                                  }}
                                  disabled={submitting}
                                  className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingTo(task.id)}
                              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium"
                            >
                              Reply & Complete Task
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => fetchTasks(currentPage - 1)}
                disabled={!previousPage}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => fetchTasks(currentPage + 1)}
                disabled={!nextPage}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-blue-400 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              {/* Man holding books */}
              <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mb-6"
            >
              <UserRound className="w-32 h-32 text-gray-700" />
            </motion.div>
      
      
              {/* Floating books */}
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
                className="text-2xl font-semibold mt-6 text-gray-700"
              >
                404 — Invalid Url
              </motion.h2>
      
              <p className="text-gray-500 mt-2">
                Redirecting you to the home page...
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      
    )}
    
    </>
  );
}