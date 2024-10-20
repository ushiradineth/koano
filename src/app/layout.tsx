import "@/app/globals.css";
import { Toaster } from "@/components/molecules/Sonnar";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/plugin/duration";
import "dayjs/plugin/relativeTime";
import "dayjs/plugin/utc";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(weekOfYear);

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Cron",
  description: "By Ushira Dineth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar">
      <head>
        <link rel="shortcut icon" href="/icon/cron.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon/cron.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon/cron.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon/cron.png" />
      </head>
      <body
        className={cn(
          "dark min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
