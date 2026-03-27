"use client";

import dynamic from "next/dynamic";

const NotificationsPageContent = dynamic(
  () => import("./NotificationsPageContent").then((m) => m.NotificationsPageContent),
  { ssr: false }
);

export function NotificationsPageClient() {
  return <NotificationsPageContent />;
}

