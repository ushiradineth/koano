import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/molecules/Select";
import { useSettingContext } from "@/components/utils/Context";
import { View } from "@/lib/types";
import { SelectValue } from "@radix-ui/react-select";

export default function ViewPicker() {
	const settingContext = useSettingContext();

	return (
		<Select
			onValueChange={(value) => settingContext.setView(Number(value) as View)}
			defaultValue={String(settingContext.view)}>
			<SelectTrigger className="w-[80px] xs:w-[120px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="1">Day</SelectItem>
				<SelectItem value="3">3 Days</SelectItem>
				<SelectItem value="7">Week</SelectItem>
				<SelectItem value="30">Month</SelectItem>
			</SelectContent>
		</Select>
	);
}
