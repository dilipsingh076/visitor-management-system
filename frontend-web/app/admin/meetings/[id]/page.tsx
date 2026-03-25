"use client";

import { use } from "react";
import { MeetingDetailContent } from "./_components/MeetingDetailContent";

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <MeetingDetailContent meetingId={id} />;
}
