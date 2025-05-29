import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import dayjs from "dayjs";
import "dayjs/plugin/duration";
import "dayjs/plugin/relativeTime";
import "dayjs/plugin/utc";
import type { Metadata } from "next";

import QueryClientProviderWrapper from "@/components/atoms/QueryClientProvider";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { SessionProvider } from "next-auth/react";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(weekOfYear);

export const metadata: Metadata = {
  title: `${dayjs().format("MMMM, YYYY")} · Koano`,
  description: "By Ushira Dineth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar select-none">
      <head>
        <link rel="shortcut icon" href="/icon/koano.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon/koano.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icon/koano.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icon/koano.png"
        />
      </head>
      <body className="dark min-h-screen max-w-[1440px] font-sans antialiased">
        <SessionProvider>
          <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
