import Context from "@/components/utils/Context";
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
			<Context>
				<section>
					{children}
					{event}
				</section>
			</Context>
		</Suspense>
	);
}
