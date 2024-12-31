import Logo from "@/components/atoms/Logo";
import SettingPicker from "@/components/atoms/SettingPicker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { headerHeight, sidebarWidth } from "@/lib/consts";
import { useSettingStore } from "@/lib/stores/settings";
import { Clock, View } from "@/lib/types";
import { User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  scrollToCurrentDate: () => void;
  month: string;
  year: string;
}

export default function Header({ scrollToCurrentDate, month, year }: Props) {
  const { data: session, status } = useSession();
  const { settings, setSettings } = useSettingStore();

  return (
    <nav
      style={{ height: headerHeight, width: `calc(100vw - ${sidebarWidth}px)` }}
      className="flex fixed left-0 top-0 items-center justify-between border-b bg-background px-2 z-50 gap-4">
      <div className="flex flex-row items-center justify-center gap-4">
        <Logo />
        <p className="font-semibold mt-1">
          {month} {year}
        </p>
      </div>
      <span className="flex gap-2">
        {status === "authenticated" && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback className="bg-foreground-tertiary">
                  <User className="h-4 w-4 shrink-0 opacity-50" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <p>Logout</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <SettingPicker
          defaultValue={settings.clock}
          setSetting={(value) =>
            setSettings({ ...settings, clock: Number(value) as Clock })
          }
          data={[
            { value: 12, label: "12" },
            { value: 24, label: "24" },
          ]}
        />

        <SettingPicker
          defaultValue={settings.view}
          setSetting={(value) =>
            setSettings({ ...settings, view: Number(value) as View })
          }
          data={[
            { value: 1, label: "Day" },
            { value: 3, label: "3 Days" },
            { value: 7, label: "Week" },
            { value: 30, label: "Month" },
          ]}
        />
        <Button
          className="text-foreground bg-foreground-tertiary hover:bg-background/30 w-fit"
          onClick={() => scrollToCurrentDate()}>
          <p>Today</p>
        </Button>
      </span>
    </nav>
  );
}
