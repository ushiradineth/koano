import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Cron - Dashboard",
  description: "By Ushira Dineth",
};

export default function DashboardLayout({
  children,
  event,
}: {
  children: React.ReactNode;
  event: React.ReactNode;
}) {
  return (
    <Suspense>
      <section>
        {children}
        {event}
      </section>
    </Suspense>
  );
}
