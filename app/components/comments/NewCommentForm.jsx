"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CommentAPI, PointRewardAPI, CommentReactionAPI } from "@/app/services/api";
import { formatDistanceToNow } from "date-fns";
import {
  Plus, ThumbsUp, Heart, Laugh, Zap, Frown, Angry,
  HelpingHand, Meh, PartyPopper, Mic, Square
} from "lucide-react";


export default function NewCommentForm({ publicationId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState({});

  const audioInputRef = useRef(null);
  const [draftAudio, setDraftAudio] = useState(null);
  const [draftAudioURL, setDraftAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const prevCommentsLength = useRef(0);
  const [deletingIds, setDeletingIds] = useState(new Set());




  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ---------------------------
  // FETCH COMMENTS
  // ---------------------------
  const fetchComments = useCallback(async () => {
    if (!publicationId) return;
    try {
      const res = await CommentAPI.list(publicationId);
      const data = res.data || [];
      const normalized = Array.isArray(data)
        ? data.map((c) => ({
            ...c,
            user_reaction: c.user_reaction ?? null,
            reactions: c.reactions ?? {},
          }))
        : [];
      setComments(normalized);
      console.log(res.data)
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [publicationId]);

  useEffect(() => {
    if (publicationId) fetchComments();
  }, [publicationId, fetchComments]);


 useEffect(() => {
  if (comments.length > prevCommentsLength.current) {
    scrollToBottom();
  }
  prevCommentsLength.current = comments.length;
}, [comments]);


  // Helper to check if comment is older than 1 hour
const isEditable = (created_at) => {
  const oneHour = 60 * 60 * 1000;
  const createdTime = new Date(created_at).getTime();
  return Date.now() - createdTime < oneHour;
};


  // ---------------------------
  // AUDIO RECORDING (FIXED)
  // ---------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm", // Browser-supported & Cloudinary-supported
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        setDraftAudio(file);

        const url = URL.createObjectURL(blob);
        setDraftAudioURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } catch (error) {
      console.error("Stop recording error:", error);
    }
  };

  // FILE SELECT FOR AUDIO
  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDraftAudio(file);
      setDraftAudioURL(URL.createObjectURL(file));
    }
  };

  // ---------------------------
  // SUBMIT COMMENT (FIXED)
  // ---------------------------
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!newComment && !draftAudio) {
    toast.error("Write a message or attach audio");
    return;
  }

  setIsSending(true);  // ⬅ LOCK SEND BUTTON

  try {
    // If editing
    if (editingCommentId) {
      const formData = new FormData();
      formData.append("text", newComment);
      if (draftAudio) formData.append("audio", draftAudio);

      await CommentAPI.update(publicationId, editingCommentId, formData);
      toast.success("Comment updated");

      setEditingCommentId(null);
      setNewComment("");
      setDraftAudio(null);
      setDraftAudioURL("");

      fetchComments();
      return; // ⬅ Unlock happens in finally
    }

    // Creating a new comment
    const formData = new FormData();
    formData.append("text", newComment);
    if (draftAudio) formData.append("audio", draftAudio);

    await CommentAPI.create(publicationId, formData);

    setNewComment("");
    setDraftAudio(null);
    setDraftAudioURL("");

    fetchComments();
    toast.success("Comment posted!");

  } catch (err) {
    console.error(err);
    toast.error("Failed to post comment");
  } finally {
    setIsSending(false);  // ⬅ UNLOCK SEND BUTTON
  }
};


  // ---------------------------
  // REACTIONS
  // ---------------------------
  const handleReaction = async (commentId, emoji) => {
    try {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;

          const prevReactions = { ...(c.reactions || {}) };
          const prevUserReaction = c.user_reaction;

          if (prevUserReaction && prevReactions[prevUserReaction] > 0) {
            prevReactions[prevUserReaction]--;
          }
          prevReactions[emoji] = (prevReactions[emoji] || 0) + 1;

          return { ...c, reactions: prevReactions, user_reaction: emoji };
        })
      );

      const res = await CommentReactionAPI.react(commentId, { emoji });
      const returned = res?.data || {};

      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          return {
            ...c,
            reactions: returned.reactions ?? c.reactions,
            user_reaction: returned.user_reactions?.[String(commentId)] ?? c.user_reaction,
          };
        })
      );
    } catch (err) {
      toast.error("Failed to react.");
      fetchComments();
    }
  };

  const emojiIcons = {
    like: ThumbsUp,
    love: Heart,
    haha: Laugh,
    wow: Zap,
    sad: Frown,
    angry: Angry,
    care: HelpingHand,
    confused: Meh,
    party: PartyPopper,
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-indigo-50 xl:min-w-4xl xl:mx-auto rounded-xl p-4 border border-indigo-100">
        <h3 className="font-semibold text-indigo-800">Discussion</h3>
      </div>

      <div className="h-150 md:min-h-screen xl:min-w-4xl xl:mx-auto overflow-y-auto p-3 bg-white/70 rounded-xl border border-gray-200 shadow-inner">
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((cmt) => {
              const isMe = cmt.is_current_user;

              return (
                <motion.div
                  key={cmt.id}
                  className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-sm">
                      {cmt.author_name?.[0]?.toUpperCase() || "A"}
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[70%] shadow-sm ${
                      isMe
                        ? "bg-white text-gray-800"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-indigo-700">{cmt.author_name}</p>
                        <span className="text-[11px] text-gray-400">
                          {formatDistanceToNow(new Date(cmt.created_at))} ago
                        </span>
                      </div>

                      {/* AUDIO OR TEXT */}
                      <div>
                          <p className="text-sm font-semibold text-gray-700">{cmt.text}</p>
                          {/* UPDATE + DELETE BUTTONS (Only for current user + editable within 1 hour) */}
        {isMe && !cmt.audio_url && isEditable(cmt.created_at) && (
  <div className="flex justify-end gap-3 mt-2 text-xs">
    <button
      onClick={() => {
        setNewComment(cmt.text);
        setDraftAudio(null);
        setDraftAudioURL("");
        setEditingCommentId(cmt.id);
      }}
      className="text-blue-600 hover:underline"
    >
      Edit
    </button>

    <button
  disabled={deletingIds.has(cmt.id)}
  onClick={async () => {
    if (deletingIds.has(cmt.id)) return; // double-protection

    // Mark as deleting
    setDeletingIds(prev => new Set(prev).add(cmt.id));

    // Optimistically remove from list
    const oldComments = comments;
    setComments(prev => prev.filter(x => x.id !== cmt.id));

    try {
      await CommentAPI.delete(publicationId, cmt.id);
      toast.success("Comment deleted");
    } catch (err) {
      // Restore UI if deletion failed
      setComments(oldComments);
    } finally {
      // Remove from deleting list
      setDeletingIds(prev => {
        const copy = new Set(prev);
        copy.delete(cmt.id);
        return copy;
      });
    }
  }}
  className={`text-red-600 hover:underline ${
    deletingIds.has(cmt.id) ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  Delete
</button>

  </div>
)}


                      </div>
                      {cmt.audio_url && (
                        <audio controls className="mt-2 w-full">
                        <source src={cmt.audio_url + "?f=webm&resource_type=video"} type="audio/webm" />
                      </audio>

                      )}

                      {/* REACTIONS */}
                      <div className=" flex items-center justify-between mt-20">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Object.entries(cmt.reactions || {})
                            .filter(([, count]) => count > 0)
                            .map(([emojiKey, count]) => {
                              const Icon = emojiIcons[emojiKey];
                              const isUserReacted = cmt.user_reaction === emojiKey;

                              return (
                                <div
                                  key={emojiKey}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                    isUserReacted
                                      ? "bg-blue-50 text-blue-700 border border-blue-300"
                                      : "bg-gray-100 text-gray-700 border border-gray-300"
                                  }`}
                                >
                                  {Icon && <Icon size={14} />}
                                  <span>{count}</span>
                                </div>
                              );
                            })}
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowEmojiPicker((prev) => ({
                                ...prev,
                                [cmt.id]: !prev[cmt.id],
                              }))
                            }
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs font-medium"
                          >
                            <Plus size={14} /> React
                          </button>

                          {showEmojiPicker[cmt.id] && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl w-30 grid grid-cols-3 p-2 gap-1 z-50">
                              {Object.keys(emojiIcons).map((emoji) => {
                                const Icon = emojiIcons[emoji];
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      handleReaction(cmt.id, emoji);
                                      setShowEmojiPicker((prev) => ({ ...prev, [cmt.id]: false }));
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                  >
                                    {Icon && <Icon size={15} />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <div ref={chatEndRef} />
        
        {/* AUDIO DRAFT INDICATOR + CANCEL BUTTON */}
{draftAudio && (
  <div className="flex items-center gap-1 justify-end mt-3">
    <div className="flex items-center gap-1 ">
      {/* Audio Preview */}
      {draftAudioURL && (
        <audio controls className="h-10">
          <source src={draftAudioURL} type="audio/webm" />
        </audio>   
      )}
    </div>

    {/* Cancel Draft */}
    <button
      onClick={() => {
        setDraftAudio(null);
        setDraftAudioURL("");
        // toast.info("Audio draft removed");
      }}
      className="px-2 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
    >
      <i className="bi bi-x-lg"></i>
    </button>
  </div>
)}


      </div>
      

      {/* INPUT BAR */}
      <form onSubmit={handleSubmit} className="flex gap-3 xl:min-w-4xl xl:mx-auto relative p-6 bg-linear-to-r from-gray-50 to-white border-t border-gray-200">
        <div className="relative flex-1">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-20 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="file"
            accept="audio/*"
            ref={audioInputRef}
            style={{ display: "none" }}
            onChange={handleAudioSelect}
          />

          <button
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500"
            onClick={() => audioInputRef.current?.click()}
          >
            <Plus size={20} />
          </button>

          <button
            type="button"
            className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full ${
              isRecording ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
           {isRecording ? (
              <span className="flex items-center gap-2 text-red-600 animate-pulse">
                <Square className="w-5 h-5" />
              </span>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
  type="submit"
  disabled={isSending}
  className={`px-6 py-2 rounded-lg text-white 
    ${isSending ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"}
  `}
>
  {isSending ? "Send" : "Send"}
</button>

      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
