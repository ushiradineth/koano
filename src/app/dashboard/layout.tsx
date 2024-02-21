import Context from "@/components/Context";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Cron - Dashboard",
	description: "By Ushira Dineth",
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section>
			<Context>
				<Suspense>{children}</Suspense>
			</Context>
		</section>
	);
}
