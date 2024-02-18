import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

interface Props {
	scrollToCurrentDate: () => void;
}

export default function Header({ scrollToCurrentDate }: Props) {
	return (
		<nav className="sticky left-0 top-0 flex h-14 w-screen items-center border-b bg-background px-2 z-50">
			<span className="flex gap-2 items-center justify-center group">
				<p className="flex text-3xl font-bold font-mono group-hover:text-orange-500 duration-500 transition-all select-none">
					cron
				</p>
				<Link
					href={"https://github.com/ushiradineth/cron"}
					target="_blank"
					className="group-hover:block hidden duration-500 transition-all">
					<GitHubLogoIcon className="h-6 w-6" />
				</Link>
			</span>
			<Button
				className="ml-auto font-semibold"
				onClick={() => scrollToCurrentDate()}>
				Today
			</Button>
		</nav>
	);
}
