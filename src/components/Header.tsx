import { Button } from "@/components/ui/button";
import { View } from "@/lib/types";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { SelectValue } from "@radix-ui/react-select";
import Link from "next/link";
import { useDataContext } from "./Context";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

interface Props {
	scrollToCurrentDate: () => void;
	month: string;
	year: string;
}

export default function Header({ scrollToCurrentDate, month, year }: Props) {
	const dataContext = useDataContext();

	return (
		<nav className="sticky left-0 top-0 flex h-14 w-screen items-center border-b bg-background px-2 z-50 gap-4">
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
			<span className="flex gap-2 items-center justify-center ml-auto">
				<Select
					onValueChange={(value) => dataContext.setView(Number(value) as View)}
					defaultValue={String(dataContext.view)}>
					<SelectTrigger className="w-[60px] sm:w-[120px]" defaultValue={"Day"}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1">Day</SelectItem>
						<SelectItem value="3">3 Days</SelectItem>
						<SelectItem value="7">Week</SelectItem>
						<SelectItem value="30">Month</SelectItem>
					</SelectContent>
				</Select>
				<Button className="font-semibold" onClick={() => scrollToCurrentDate()}>
					Today
				</Button>
			</span>
		</nav>
	);
}
