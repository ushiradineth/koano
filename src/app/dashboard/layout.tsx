import { Suspense } from "react";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section>
			<Suspense>{children}</Suspense>
		</section>
	);
}
