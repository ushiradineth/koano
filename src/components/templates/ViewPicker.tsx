import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useSettingStore } from "@/lib/stores/settings";
import { View } from "@/lib/types";
import { SelectValue } from "@radix-ui/react-select";

export default function ViewPicker() {
  const { settings, setSettings } = useSettingStore();

  return (
    <Select
      onValueChange={(value) =>
        setSettings({ ...settings, view: Number(value) as View })
      }
      defaultValue={String(settings.view)}>
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
