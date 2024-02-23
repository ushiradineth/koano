import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/molecules/Select";
import { useSettingContext } from "@/components/utils/Context";
import { breakpoint } from "@/lib/consts";
import { View } from "@/lib/types";
import { SelectValue } from "@radix-ui/react-select";
import { useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";

interface Props {
	scrollToCurrentDate: () => void;
}

export default function ViewPicker({ scrollToCurrentDate }: Props) {
	const settingContext = useSettingContext();
	const [view, setView] = useState(settingContext.view);
	const { width } = useWindowSize({
		debounceDelay: 100,
		initializeWithValue: true,
	});

	useEffect(() => {
		if (width < breakpoint && settingContext.view >= 7) {
			setView(3);
			scrollToCurrentDate();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [width]);

	useEffect(() => {
		settingContext.setView(view);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [view]);

	return (
		<Select
			value={String(view)}
			onValueChange={(value) => setView(Number(value) as View)}>
			<SelectTrigger className="w-[80px] xs:w-[120px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="1">Day</SelectItem>
				<SelectItem value="3">3 Days</SelectItem>
				{width > breakpoint && (
					<>
						<SelectItem value="7">Week</SelectItem>
						<SelectItem value="30">Month</SelectItem>
					</>
				)}
			</SelectContent>
		</Select>
	);
}
