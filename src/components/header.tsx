import React from "react";
import { Button } from "./ui/button";

interface Props {
	scrollToCurrentDate: (behavior: "smooth" | "instant") => void;
}

export default function Header({ scrollToCurrentDate }: Props) {
	return (
		<nav className="sticky left-0 top-0 flex h-14 w-screen items-center border-b bg-background px-2">
			<p className="flex text-2xl font-semibold">CRON</p>
			<Button
				className="ml-auto font-semibold"
				onClick={() => scrollToCurrentDate("smooth")}>
				Today
			</Button>
		</nav>
	);
}
