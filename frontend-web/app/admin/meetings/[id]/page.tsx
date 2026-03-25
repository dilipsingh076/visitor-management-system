import { MeetingDetailContent } from "./_components/MeetingDetailContent";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MeetingDetailContent meetingId={id} />;
}
