import { cn } from "@/lib/utils";

interface Props {
	quarter: number;
	border: boolean;
	selecting: boolean;
	setSelecting: (value: boolean) => void;
	highlight: boolean;
	setDone: (value: boolean) => void;
	setStart: (value: number) => void;
	setEnd: (value: number) => void;
}

export default function Quarter({
	quarter,
	border,
	selecting,
	setSelecting,
	highlight,
	setDone,
	setStart,
	setEnd,
}: Props) {
	return (
		<span
			className={cn(
				"flex items-center justify-center",
				border && "border-t",
				"h-[15px] w-full",
				highlight && "border-purple-400 border-opacity-25 bg-purple-300 bg-opacity-50",
			)}
			onMouseDown={() => {
				if (!highlight) {
					// Reset previous selection
					setEnd(-1);
				}

				setSelecting(true);
				setDone(false);

				// Start selecting from the current quarter
				setStart(quarter);
			}}
			onMouseUp={() => {
				setSelecting(false);
				setEnd(quarter);
			}}
			onMouseOver={() => selecting && setEnd(quarter)}
		/>
	);
}
