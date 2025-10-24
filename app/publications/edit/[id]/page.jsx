"use client";

import { useParams } from "next/navigation";
import ResubmissionForm from "@/app/components/PublicationResubmitForm";

export default function EditPublicationPage() {
  const { id } = useParams(); //  useParams() instead of router.query

  if (!id) {
    return <p className="text-red-600 text-center mt-10">No publication ID provided.</p>;
  }

  return <ResubmissionForm publicationId={id} />;
}
