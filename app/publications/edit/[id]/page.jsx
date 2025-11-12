"use client";

import { use } from "react";
// app/publications/[id]/edit/page.jsx
import PublicationResubmitForm from "@/app/components/PublicationResubmitForm";

export default function EditPublicationPage({ params }) {
  const { id } = use(params);

  if (!id) return <p className="text-red-600">No ID</p>;

  return <PublicationResubmitForm publicationId={id} />;
}