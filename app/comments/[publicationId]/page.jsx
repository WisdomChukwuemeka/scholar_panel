// app/comments/[publicationId]/page.jsx
"use client";

import { useParams } from "next/navigation";
import NewCommentForm from "@/app/components/comments/NewCommentForm";

export default function CommentsPage() {
  const { publicationId } = useParams(); // This is a string (e.g. "123" or UUID)

  // Add this log to debug
  console.log("Publication ID from URL:", publicationId);

  return (
    <div className="container mx-auto p-4">
      {/* Pass it here! */}
      <NewCommentForm publicationId={publicationId} />
    </div>
  );
}