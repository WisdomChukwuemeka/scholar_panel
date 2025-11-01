// app/comments/[publicationId]/page.jsx
"use client";

import { useParams } from "next/navigation";
import NewCommentForm from "@/app/components/comments/NewCommentForm";

export default function CommentsPage() {
  const { publicationId } = useParams(); // ← full UUID

  return (
    <div className="container mx-auto p-4">
      <NewCommentForm />
    </div>
  );
}