import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import ViewPicker from "./ViewPicker";

interface Props {
	scrollToCurrentDate: () => void;
	month: string;
	year: string;
}

export default function Header({ scrollToCurrentDate, month, year }: Props) {
	return (
		<nav className="sticky left-0 top-0 flex h-20 xs:h-14 w-screen items-center border-b bg-background px-2 z-50 gap-4">
			<div className="flex flex-col xs:flex-row items-center justify-center xs:gap-4">
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
				<p className="flex font-semibold h-full items-center justify-center mt-1">
					{month} {year}
				</p>
			</div>
			<span className="flex gap-2 items-center justify-center ml-auto">
				<ViewPicker />
				<Button className="font-semibold" onClick={() => scrollToCurrentDate()}>
					<p>Today</p>
				</Button>
			</span>
		</nav>
	);
}
