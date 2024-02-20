import Context from "@/components/Context";
import { Suspense } from "react";

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
